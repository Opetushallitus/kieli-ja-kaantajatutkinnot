import axios from 'configs/axios';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  cancelRegistrationRequest,
  getRegistrationDetails,
  initRegistrationRequest,
  registrationEndpoint,
  submitRegistrationRequest,
} from 'features/registration/api/apiv2';
import { RegistrationSubmitRequest } from 'features/registration/modelv2';
import {
  registrationFixture,
  resetRegistrationMocks,
  saveRegistration,
} from 'features/registration/tests/handlersv2';

const key = { examSessionId: 100, registrationId: 501 };
const selection = {
  examSessionId: 100,
  partialExamType: 'READ' as const,
  registrationKind: RegistrationKind.Admission,
};
const body: RegistrationSubmitRequest = {
  nationalities: ['246'],
  gender: '',
  lang: 'fi',
};
const now = Date.parse('2026-10-01T09:00:00Z');
beforeEach(() => {
  resetRegistrationMocks();
  sessionStorage.setItem('msw:yki-v2-now', String(now));
});
afterEach(() => {
  resetRegistrationMocks();
  sessionStorage.removeItem('msw:yki-v2-now');
});

it('resumes an exact init retry without extending the reservation', async () => {
  const original = registrationFixture();
  saveRegistration(original);
  sessionStorage.setItem('msw:yki-v2-now', String(now + 60000));
  const { data } = await initRegistrationRequest(selection);
  expect(data.registration_id).toBe(501);
  expect(data.reservation_expires_at).toBe(original.reservation_expires_at);
  expect(data.expires_in).toBe(1740);
});

it.each([
  { ...selection, registrationKind: RegistrationKind.Queue },
  { ...selection, partialExamType: 'SPEAK' as const },
  { ...selection, examSessionId: 999 },
])(
  'returns the complete original selection on conflict: %s',
  async (request) => {
    saveRegistration(registrationFixture());
    await expect(initRegistrationRequest(request)).rejects.toMatchObject({
      response: {
        status: 409,
        data: {
          error: {
            'other-exam-session-registration': {
              id: 100,
              registration_id: 501,
              state: 'STARTED',
              partial_exam_type: 'READ',
              kind: 'ADMISSION',
            },
          },
        },
      },
    });
    expect(
      (await initRegistrationRequest(selection)).data.registration_id,
    ).toBe(501);
  },
);

it('reads expiration without mutating storage and creates a reservation only on explicit init', async () => {
  // Use a real listing fixture for the new init request.
  const original = registrationFixture({
    exam_session: { ...registrationFixture().exam_session, id: 999 },
    partial_exam_type: 'ALL_PARTS',
    reservation_expires_at: new Date(now - 1).toISOString(),
  });
  saveRegistration(original);
  const stored = sessionStorage.getItem('msw:yki-registration-v2');
  const expiredKey = { ...key, examSessionId: 999 };
  expect((await getRegistrationDetails(expiredKey)).data).toMatchObject({
    state: RegistrationStates.Expired,
    reservation_expires_at: null,
  });
  expect(sessionStorage.getItem('msw:yki-registration-v2')).toBe(stored);
  await expect(
    axios.get(original.authentication_urls.suomifi),
  ).rejects.toMatchObject({ response: { status: 410 } });
  await expect(
    submitRegistrationRequest(expiredKey, body),
  ).rejects.toMatchObject({
    response: { status: 409, data: { error: { expired: true } } },
  });
  const replacement = (
    await initRegistrationRequest({
      ...selection,
      examSessionId: 999,
      partialExamType: 'ALL_PARTS',
    })
  ).data;
  expect(replacement.registration_id).not.toBe(original.registration_id);
  expect(replacement.state).toBe(RegistrationStates.Started);
  expect(Date.parse(replacement.reservation_expires_at!)).toBeGreaterThan(now);
});

it.each(['suomifi', 'email'] as const)(
  'preserves IDs and deadline through mock %s authentication',
  async (method) => {
    const original = registrationFixture({
      session: { identity: null },
      user: {},
      is_strongly_identified: false,
    });
    saveRegistration(original);
    await axios.get(original.authentication_urls[method]);
    expect((await getRegistrationDetails(key)).data).toMatchObject({
      registration_id: 501,
      exam_session: { id: 100 },
      reservation_expires_at: original.reservation_expires_at,
      session: { 'auth-method': method === 'email' ? 'EMAIL' : 'SUOMIFI' },
    });
  },
);

it.each([
  [RegistrationKind.Admission, false, RegistrationStates.Submitted],
  [RegistrationKind.Admission, true, RegistrationStates.Completed],
  [RegistrationKind.Queue, false, RegistrationStates.Submitted],
  [RegistrationKind.Queue, true, RegistrationStates.Submitted],
] as const)(
  'submits %s (free=%s) once and recovers a lost response',
  async (kind, free, state) => {
    saveRegistration(registrationFixture({ registration_kind: kind }));
    const submission = {
      ...body,
      ...(free ? { free_registration_id: 10 } : {}),
    };
    const result = (await submitRegistrationRequest(key, submission)).data;
    expect(result).toMatchObject({
      state,
      is_free: free,
      reservation_expires_at: null,
    });
    expect(result.payment === null).toBe(
      free || kind === RegistrationKind.Queue,
    );
    expect((await submitRegistrationRequest(key, submission)).data).toEqual(
      result,
    );
    expect((await getRegistrationDetails(key)).data).toEqual(result);
  },
);

it.each(['pending', 'cancelled', 'paid'])(
  'restores mock payment outcome %s from GET',
  async (outcome) => {
    saveRegistration(registrationFixture());
    await submitRegistrationRequest(key, body);
    const { data: redirect } = await axios.get(
      `${registrationEndpoint(key)}/mock-payment?outcome=${outcome}`,
    );
    const { data } = await getRegistrationDetails(key);
    expect(data.payment?.status).toBe(outcome.toUpperCase());
    expect(data.state).toBe(
      outcome === 'paid'
        ? RegistrationStates.Completed
        : RegistrationStates.Submitted,
    );
    expect(redirect.redirect_url).toContain(
      outcome === 'paid' ? '/valmis/' : '/maksa/',
    );
  },
);

it('allows safe cancellation replay and never cancels a different session', async () => {
  saveRegistration(registrationFixture());
  await expect(
    cancelRegistrationRequest({ ...key, examSessionId: 101 }),
  ).rejects.toMatchObject({ response: { status: 404 } });
  await cancelRegistrationRequest(key);
  await cancelRegistrationRequest(key);
  expect((await getRegistrationDetails(key)).data.state).toBe(
    RegistrationStates.Cancelled,
  );
});
