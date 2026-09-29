import { http, HttpResponse } from 'msw';

import { APIEndpoints, PaymentStatus } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationInitRequest } from 'interfaces/publicRegistration';
import {
  RegistrationContext,
  RegistrationKey,
  RegistrationSubmitRequest,
} from 'interfaces/registrationContext';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SuomiFiAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';
import { getMockSession } from 'tests/msw/session';
import { registrationEndpoint } from 'utils/registrationApi';

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
    state: RegistrationStates.Started,
    expires_in: 1800,
    reservation_expires_at: new Date(now() + 1800000).toISOString(),
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
    },
    { status: 409 },
  );

export const registrationHandlers = [
  http.post(APIEndpoints.InitRegistration, async ({ request }) => {
    const body = (await request.json()) as PublicRegistrationInitRequest;
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
    const session = getMockSession();
    const data = registrationFixture({
      user:
        session.identity && session['auth-method'] !== 'CAS'
          ? session.identity
          : {},
      is_strongly_identified:
        !!session.identity && session['auth-method'] === 'SUOMIFI',
      exam_session,
      registration_id:
        Math.max(500, ...Object.keys(readRecords()).map(Number)) + 1,
      partial_exam_type: body.partial_exam_type,
      registration_kind: kind,
    });
    saveRegistration(data);

    return response(data);
  }),
  http.get(APIEndpoints.Registration, ({ params }) => {
    const data = lookup(params);

    return data ? response(data) : new HttpResponse(null, { status: 404 });
  }),
  http.post(
    `${APIEndpoints.Registration}/submit`,
    async ({ params, request }) => {
      const data = lookup(params);
      if (!data || !getMockSession().identity)
        return new HttpResponse(null, { status: 401 });
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
  http.get(
    `${APIEndpoints.Registration}/mock-payment`,
    ({ params, request }) => {
      const data = lookup(params);
      if (!data?.payment || data.state !== RegistrationStates.Submitted)
        return new HttpResponse(null, { status: 404 });
      const outcome =
        new URL(request.url).searchParams.get('outcome') || 'paid';
      if (!['paid', 'pending', 'cancelled'].includes(outcome))
        return new HttpResponse(null, { status: 400 });
      const paid = outcome === 'paid';
      saveRegistration({
        ...data,
        state: paid
          ? RegistrationStates.Completed
          : RegistrationStates.Submitted,
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
        redirect_url: `${AppRoutes.RegistrationPaymentStatus}?id=${data.exam_session.id}&status=${paid ? PaymentStatus.Success : outcome === 'cancelled' ? PaymentStatus.Cancel : PaymentStatus.Error}`,
      });
    },
  ),
  http.delete(APIEndpoints.Registration, ({ params }) => {
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
