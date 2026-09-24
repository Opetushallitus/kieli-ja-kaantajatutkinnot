import { http, HttpResponse } from 'msw';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationAPI,
  registrationEndpoint,
} from 'features/registration/api/apiv2';
import {
  RegistrationContext,
  RegistrationInitErrorResponse,
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
    ? currentContext(data)
    : undefined;
};
// Expiry is derived on reads; GET never writes or extends the reservation.
const currentContext = (data: RegistrationContext): RegistrationContext =>
  data.state === RegistrationStates.Started &&
  data.reservation_expires_at &&
  Date.parse(data.reservation_expires_at) <= now()
    ? {
        ...data,
        state: RegistrationStates.Expired,
        reservation_expires_at: null,
      }
    : data;
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
const conflict = (data: RegistrationContext) =>
  HttpResponse.json(
    {
      error: {
        'other-exam-session-registration': {
          id: data.exam_session.id,
          registration_id: data.registration_id,
          state: data.state,
          partial_exam_type: data.partial_exam_type,
          kind: data.registration_kind,
        },
      },
    } satisfies RegistrationInitErrorResponse,
    { status: 409 },
  );

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
              partial_exam_type: 'ALL_PARTS',
              kind: 'ADMISSION',
            },
          },
        },
        { status: 409 },
      );
    if (body.exam_session_id === 3)
      return HttpResponse.json({ error: { closed: true } }, { status: 409 });
    if (body.exam_session_id === 6 && !body.to_queue)
      return HttpResponse.json({ error: { full: true } }, { status: 409 });
    const kind = body.to_queue
      ? RegistrationKind.Queue
      : RegistrationKind.Admission;
    // All records in this mock tab belong to one participant. Real ownership
    // checks must be implemented by the backend, independently of numeric IDs.
    const existing = Object.values(readRecords())
      .map(currentContext)
      .find((item) => item.state === RegistrationStates.Started);
    if (existing) {
      return existing.exam_session.id === body.exam_session_id &&
        existing.partial_exam_type === body.partial_exam_type &&
        existing.registration_kind === kind
        ? response(existing)
        : conflict(existing);
    }
    const exam_session = examSessions.exam_sessions.find(
      (session) => session.id === body.exam_session_id,
    );
    if (!exam_session) return new HttpResponse(null, { status: 404 });
    const data = registrationFixture({
      exam_session,
      registration_id:
        Math.max(500, ...Object.keys(readRecords()).map(Number)) + 1,
      partial_exam_type: body.partial_exam_type,
      registration_kind: kind,
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
    if (data.state !== RegistrationStates.Started)
      return new HttpResponse(null, { status: 410 });
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
      // Prototype replay semantics: a lost successful response can be recovered
      // without another payment. Backend transactional guarantees remain separate.
      if (
        [RegistrationStates.Submitted, RegistrationStates.Completed].includes(
          data.state,
        )
      )
        return response(data);
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
  http.get(`${RegistrationAPI.Details}/mock-payment`, ({ params, request }) => {
    const data = lookup(params);
    if (!data?.payment || data.state !== RegistrationStates.Submitted)
      return new HttpResponse(null, { status: 404 });
    const outcome = new URL(request.url).searchParams.get('outcome') || 'paid';
    if (!['paid', 'pending', 'cancelled'].includes(outcome))
      return new HttpResponse(null, { status: 400 });
    const paid = outcome === 'paid';
    saveRegistration({
      ...data,
      state: paid ? RegistrationStates.Completed : RegistrationStates.Submitted,
      payment: {
        ...data.payment,
        status: paid
          ? 'PAID'
          : outcome === 'cancelled'
            ? 'CANCELLED'
            : 'PENDING',
      },
    });

    return HttpResponse.json({
      redirect_url: stepPath(paid ? 'Done' : 'Payment', {
        examSessionId: data.exam_session.id,
        registrationId: data.registration_id,
      }),
    });
  }),
  http.delete(RegistrationAPI.Details, ({ params }) => {
    const data = lookup(params);
    if (!data) return new HttpResponse(null, { status: 404 });
    if (data.state === RegistrationStates.Cancelled)
      return new HttpResponse(null, { status: 204 });
    if (data.state === RegistrationStates.Expired)
      return new HttpResponse(null, { status: 410 });
    if (data.state !== RegistrationStates.Started)
      return new HttpResponse(null, { status: 409 });
    saveRegistration({
      ...data,
      state: RegistrationStates.Cancelled,
      reservation_expires_at: null,
    });

    return new HttpResponse(null, { status: 204 });
  }),
];
