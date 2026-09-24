import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationContractError,
  validateRegistrationContext,
} from 'features/registration/api/contractv2';
import {
  RegistrationContext,
  RegistrationStep,
} from 'features/registration/modelv2';
import { responseStep } from 'features/registration/routesv2';
import { registrationFixture } from 'features/registration/tests/handlersv2';
import { WeaklyAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';

const key = { examSessionId: 100, registrationId: 501 };
const payment = {
  url: '/payment/501',
  due_date: '2030-01-01T12:00:00Z',
  status: 'PENDING' as const,
};
const submitted = {
  state: RegistrationStates.Submitted,
  reservation_expires_at: null,
};
const completed = {
  state: RegistrationStates.Completed,
  reservation_expires_at: null,
};
const anonymous = {
  session: { identity: null },
  user: {},
  is_strongly_identified: false,
};

const cases: Array<[string, Partial<RegistrationContext>, RegistrationStep]> = [
  ['anonymous', anonymous, 'Identify'],
  ['strong identity', {}, 'Register'],
  [
    'email identity',
    {
      session: WeaklyAuthenticatedSessionResponse,
      user: WeaklyAuthenticatedSessionResponse.identity,
      is_strongly_identified: false,
    },
    'Register',
  ],
  [
    'queue',
    { ...submitted, registration_kind: RegistrationKind.Queue },
    'Done',
  ],
  [
    'free queue',
    { ...submitted, registration_kind: RegistrationKind.Queue, is_free: true },
    'Done',
  ],
  [
    'completed queue',
    { ...completed, registration_kind: RegistrationKind.Queue },
    'Done',
  ],
  ['payment preparing', submitted, 'Payment'],
  ['payment pending', { ...submitted, payment }, 'Payment'],
  [
    'payment cancelled',
    { ...submitted, payment: { ...payment, status: 'CANCELLED' } },
    'Payment',
  ],
  [
    'payment completed',
    { ...completed, payment: { ...payment, status: 'PAID' } },
    'Done',
  ],
  ['free completed', { ...completed, is_free: true }, 'Done'],
];

it.each(cases)(
  'validates and routes %s from every step',
  (_, overrides, expected) => {
    const context = registrationFixture(overrides);
    expect(() => validateRegistrationContext(context, key)).not.toThrow();
    for (const requested of [
      'Identify',
      'Register',
      'Payment',
      'Done',
    ] as const) {
      const target =
        expected === 'Register' && requested === 'Identify'
          ? 'Identify'
          : expected;
      expect(responseStep(context, requested)).toBe(target);
    }
  },
);

it.each([
  RegistrationStates.Expired,
  RegistrationStates.Cancelled,
  RegistrationStates.PaidAndCancelled,
])('accepts terminal %s as a valid unavailable response', (state) => {
  expect(() =>
    validateRegistrationContext(
      registrationFixture({ state, reservation_expires_at: null }),
      key,
    ),
  ).not.toThrow();
});

it.each([
  ['wrong registration', { registration_id: 502 }],
  ['zero registration', { registration_id: 0 }],
  ['wrong session', { exam_session: { id: 101 } }],
  ['unknown state', { state: 'FUTURE_STATE' }],
  ['unknown kind', { registration_kind: 'OTHER' }],
  ['wrong part', { partial_exam_type: 'WRITE' }],
  ['missing session', { session: undefined }],
  ['missing identity', { session: {} }],
  ['wrong identity', { user: { ssn: 'different' } }],
  ['contradictory strength', { is_strongly_identified: false }],
  [
    'anonymous user data',
    { ...anonymous, user: { email: 'other@example.invalid' } },
  ],
  ['missing free flag', { is_free: undefined }],
  ['missing auth links', { authentication_urls: {} }],
  [
    'unsafe auth link',
    {
      authentication_urls: { suomifi: 'javascript:alert(1)', email: '/email' },
    },
  ],
  ['missing deadline', { reservation_expires_at: null }],
  ['invalid deadline', { reservation_expires_at: 'not-a-date' }],
  [
    'deadline without timezone',
    { reservation_expires_at: '2030-01-01T12:00:00' },
  ],
  ['started payment', { payment }],
  ['started free outcome', { is_free: true }],
  ['submitted deadline', { state: RegistrationStates.Submitted }],
  ['anonymous submission', { ...anonymous, ...submitted }],
  [
    'queue payment',
    { ...submitted, registration_kind: RegistrationKind.Queue, payment },
  ],
  ['submitted paid', { ...submitted, payment: { ...payment, status: 'PAID' } }],
  ['submitted free admission', { ...submitted, is_free: true }],
  ['completed unpaid', { ...completed, payment }],
  ['completed without payment', completed],
  ['free with payment', { ...completed, is_free: true, payment }],
  [
    'invalid payment status',
    { ...submitted, payment: { ...payment, status: 'UNKNOWN' } },
  ],
  [
    'invalid due date',
    { ...submitted, payment: { ...payment, due_date: 'bad' } },
  ],
])('rejects %s before state hydration', (_, overrides) => {
  expect(() =>
    validateRegistrationContext(
      { ...registrationFixture(), ...overrides },
      key,
    ),
  ).toThrow(RegistrationContractError);
});

it.each([null, undefined, [], '<html>server error</html>'])(
  'rejects non-object payload %s',
  (value) => {
    expect(() => validateRegistrationContext(value, key)).toThrow(
      RegistrationContractError,
    );
  },
);
