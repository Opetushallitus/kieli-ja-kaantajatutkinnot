import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationContext,
  RegistrationStep,
} from 'features/registration/modelv2';
import { responseStep } from 'features/registration/routesv2';
import { registrationFixture } from 'features/registration/tests/handlersv2';
import { WeaklyAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';

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

it.each(cases)('routes %s from every step', (_, overrides, expected) => {
  const context = registrationFixture(overrides);
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
});
