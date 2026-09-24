import { http, HttpResponse } from 'msw';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationAPI,
  registrationEndpoint,
} from 'features/registration/api/apiv2';
import {
  RegistrationContext,
  RegistrationInitRequest,
  RegistrationKey,
  RegistrationSubmitRequest,
} from 'features/registration/modelv2';
import { stepPath } from 'features/registration/routesv2';
import { examSessions } from 'tests/msw/fixtures/examSession';
import {
  SuomiFiAuthenticatedSessionResponse,
  WeaklyAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';

const now = () =>
  Number(sessionStorage.getItem('msw:yki-v2-now')) || Date.now();
const storageKey = 'msw:yki-registration-v2';
const readRecords = (): Record<number, RegistrationContext> =>
  JSON.parse(sessionStorage.getItem(storageKey) || '{}');
export const saveRegistration = (data: RegistrationContext) =>
  sessionStorage.setItem(
    storageKey,
    JSON.stringify({ ...readRecords(), [data.registration_id]: data }),
  );
export const resetRegistrationMocks = () =>
  sessionStorage.removeItem(storageKey);

export const registrationFixture = (
  overrides: Partial<RegistrationContext> = {},
): RegistrationContext => {
  const examSession = examSessions.exam_sessions.find(
    (session) => session.id === 999,
  )!;
  const key = {
    examSessionId: overrides.exam_session?.id ?? 100,
    registrationId: overrides.registration_id ?? 501,
  };
  const auth = (method: string) =>
    RegistrationAPI.Auth.replace(':examSessionId', String(key.examSessionId))
      .replace(':registrationId', String(key.registrationId))
      .replace(':method', method);

  return {
    exam_session: {
      ...examSession,
      id: 100,
      type: 'READ_SPEAK',
      partial_registration_kind: {
        ALL_PARTS: RegistrationKind.Queue,
        READ: RegistrationKind.Admission,
        SPEAK: RegistrationKind.Queue,
      },
    },
    registration_id: 501,
    registration_kind: RegistrationKind.Admission,
    partial_exam_type: 'READ',
    is_strongly_identified: true,
    user: SuomiFiAuthenticatedSessionResponse.identity,
    session: SuomiFiAuthenticatedSessionResponse,
    state: RegistrationStates.Started,
    expires_in: 1800,
    reservation_expires_at: new Date(now() + 1800000).toISOString(),
    authentication_urls: { suomifi: auth('suomifi'), email: auth('email') },
    is_free: false,
    payment: null,
    ...overrides,
  };
};
const lookup = (params: Record<string, unknown>) => {
  const data = readRecords()[Number(params.registrationId)];

  return data?.exam_session.id === Number(params.examSessionId)
    ? data
    : undefined;
};
const response = (data: RegistrationContext) =>
  HttpResponse.json({
    ...data,
    expires_in: data.reservation_expires_at
      ? Math.max(
          0,
          Math.floor((Date.parse(data.reservation_expires_at) - now()) / 1000),
        )
      : undefined,
  });

export const registrationHandlers = [
  http.post(RegistrationAPI.Init, async ({ request }) => {
    const body = (await request.json()) as RegistrationInitRequest;
    if (body.exam_session_id === 2)
      return HttpResponse.json(
        {
          error: {
            'other-exam-session-registration': {
              id: 99,
              registration_id: 500,
              state: 'SUBMITTED',
            },
          },
        },
        { status: 409 },
      );
    if (body.exam_session_id === 3)
      return HttpResponse.json({ error: { closed: true } }, { status: 409 });
    if (body.exam_session_id === 6 && !body.to_queue)
      return HttpResponse.json({ error: { full: true } }, { status: 409 });
    const existing = Object.values(readRecords()).find(
      (item) =>
        item.exam_session.id === body.exam_session_id &&
        item.partial_exam_type === body.partial_exam_type &&
        item.state === RegistrationStates.Started,
    );
    if (existing) return response(existing);
    const exam_session = examSessions.exam_sessions.find(
      (session) => session.id === body.exam_session_id,
    );
    if (!exam_session) return new HttpResponse(null, { status: 404 });
    const data = registrationFixture({
      exam_session,
      registration_id:
        Math.max(500, ...Object.keys(readRecords()).map(Number)) + 1,
      partial_exam_type: body.partial_exam_type,
      registration_kind: body.to_queue
        ? RegistrationKind.Queue
        : RegistrationKind.Admission,
    });
    saveRegistration(data);

    return response(data);
  }),
  http.get(RegistrationAPI.Details, ({ params }) => {
    const data = lookup(params);

    return data ? response(data) : new HttpResponse(null, { status: 404 });
  }),
  // Prototype of the future Java authentication handoff. The redirect carries
  // both resource IDs, and the next step GET receives an authenticated session.
  http.get(RegistrationAPI.Auth, ({ params, request }) => {
    const data = lookup(params);
    if (!data || !['suomifi', 'email'].includes(String(params.method)))
      return new HttpResponse(null, { status: 401 });
    const strong = params.method === 'suomifi';
    const email =
      new URL(request.url).searchParams.get('email') ||
      WeaklyAuthenticatedSessionResponse.identity.email;
    const session = strong
      ? SuomiFiAuthenticatedSessionResponse
      : {
          ...WeaklyAuthenticatedSessionResponse,
          identity: { email, 'external-user-id': email },
        };
    saveRegistration({
      ...data,
      session,
      user: session.identity,
      is_strongly_identified: strong,
    });

    return HttpResponse.json({
      redirect_url: stepPath('Register', {
        examSessionId: data.exam_session.id,
        registrationId: data.registration_id,
      }),
    });
  }),
  http.post(
    `${RegistrationAPI.Details}/submit`,
    async ({ params, request }) => {
      const data = lookup(params);
      if (!data || !data.session.identity)
        return new HttpResponse(null, { status: 401 });
      if (
        data.state !== RegistrationStates.Started ||
        !data.reservation_expires_at ||
        Date.parse(data.reservation_expires_at) <= now()
      )
        return HttpResponse.json({ error: { expired: true } }, { status: 409 });
      const body = (await request.json()) as RegistrationSubmitRequest;
      const queued = data.registration_kind === RegistrationKind.Queue;
      const isFree = !!body.free_registration_id;
      const key: RegistrationKey = {
        examSessionId: data.exam_session.id,
        registrationId: data.registration_id,
      };
      const updated: RegistrationContext = {
        ...data,
        state:
          isFree && !queued
            ? RegistrationStates.Completed
            : RegistrationStates.Submitted,
        is_free: isFree,
        reservation_expires_at: null,
        payment:
          queued || isFree
            ? null
            : {
                url: `${registrationEndpoint(key)}/mock-payment`,
                due_date: new Date(now() + 86400000).toISOString(),
                status: 'PENDING',
              },
      };
      saveRegistration(updated);

      return response(updated);
    },
  ),
  http.get(`${RegistrationAPI.Details}/mock-payment`, ({ params }) => {
    const data = lookup(params);
    if (!data?.payment || data.state !== RegistrationStates.Submitted)
      return new HttpResponse(null, { status: 404 });
    saveRegistration({
      ...data,
      state: RegistrationStates.Completed,
      payment: { ...data.payment, status: 'PAID' },
    });

    return HttpResponse.json({
      redirect_url: stepPath('Done', {
        examSessionId: data.exam_session.id,
        registrationId: data.registration_id,
      }),
    });
  }),
  http.delete(RegistrationAPI.Details, ({ params }) => {
    const data = lookup(params);
    if (!data || data.state !== RegistrationStates.Started)
      return new HttpResponse(null, { status: 404 });
    saveRegistration({
      ...data,
      state: RegistrationStates.Cancelled,
      reservation_expires_at: null,
    });

    return new HttpResponse(null, { status: 204 });
  }),
];
