import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationContext,
  RegistrationKey,
} from 'features/registration/modelv2';

export class RegistrationContractError extends Error {}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown) =>
  text(value) &&
  /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));
const link = (value: unknown) => {
  if (!text(value)) return false;
  try {
    return ['http:', 'https:'].includes(
      new URL(value, 'https://yki.invalid').protocol,
    );
  } catch {
    return false;
  }
};
function requireContract(condition: unknown): asserts condition {
  if (!condition)
    throw new RegistrationContractError('Invalid registration context');
}

// Check fields used for identity, navigation and payment before accepting a response.
export function validateRegistrationContext(
  value: unknown,
  key: Pick<RegistrationKey, 'examSessionId'> & Partial<RegistrationKey>,
): asserts value is RegistrationContext {
  requireContract(record(value));
  const {
    exam_session: exam,
    session,
    user,
    payment,
    authentication_urls: auth,
  } = value;
  requireContract(record(exam) && exam.id === key.examSessionId);
  requireContract(
    Number.isSafeInteger(value.registration_id) &&
      Number(value.registration_id) > 0,
  );
  requireContract(
    key.registrationId === undefined ||
      value.registration_id === key.registrationId,
  );
  requireContract(
    Object.values(RegistrationKind).some(
      (kind) => kind === value.registration_kind,
    ),
  );
  requireContract(
    Object.values(RegistrationStates).some(
      (state) => state !== RegistrationStates.Unknown && state === value.state,
    ),
  );
  const parts =
    exam.type === 'FULL'
      ? ['ALL_PARTS']
      : exam.type === 'READ_SPEAK'
        ? ['ALL_PARTS', 'READ', 'SPEAK']
        : exam.type === 'LISTEN_WRITE'
          ? ['ALL_PARTS', 'LISTEN', 'WRITE']
          : [];
  requireContract(parts.includes(String(value.partial_exam_type)));
  requireContract(record(session) && record(user));
  requireContract(
    typeof value.is_free === 'boolean' &&
      typeof value.is_strongly_identified === 'boolean',
  );
  requireContract(record(auth) && link(auth.suomifi) && link(auth.email));
  requireContract(
    value.expires_in === undefined ||
      (typeof value.expires_in === 'number' &&
        Number.isFinite(value.expires_in) &&
        value.expires_in >= 0),
  );
  const identity = session.identity;
  if (identity === null) {
    requireContract(
      !value.is_strongly_identified && Object.keys(user).length === 0,
    );
  } else {
    requireContract(record(identity));
    if (session['auth-method'] === 'EMAIL') {
      requireContract(
        !value.is_strongly_identified &&
          text(identity.email) &&
          user.email === identity.email,
      );
      requireContract(
        text(identity['external-user-id']) &&
          user['external-user-id'] === identity['external-user-id'],
      );
    } else {
      requireContract(
        session['auth-method'] === 'SUOMIFI' && value.is_strongly_identified,
      );
      requireContract(text(identity.ssn) && user.ssn === identity.ssn);
      requireContract(text(identity.first_name) && text(identity.last_name));
      requireContract(
        user.first_name === identity.first_name &&
          user.last_name === identity.last_name,
      );
    }
  }
  requireContract(
    payment === null ||
      (record(payment) &&
        link(payment.url) &&
        timestamp(payment.due_date) &&
        ['PENDING', 'PAID', 'CANCELLED'].includes(String(payment.status))),
  );
  if (value.state === RegistrationStates.Started) {
    requireContract(
      timestamp(value.reservation_expires_at) &&
        payment === null &&
        !value.is_free,
    );

    return;
  }
  requireContract(value.reservation_expires_at === null);
  if (
    value.state === RegistrationStates.Submitted ||
    value.state === RegistrationStates.Completed
  ) {
    requireContract(identity !== null);
    if (value.registration_kind === RegistrationKind.Queue || value.is_free) {
      requireContract(payment === null);
      requireContract(
        value.registration_kind === RegistrationKind.Queue ||
          value.state === RegistrationStates.Completed,
      );
    } else if (value.state === RegistrationStates.Completed) {
      requireContract(payment?.status === 'PAID');
    } else {
      requireContract(payment === null || payment.status !== 'PAID');
    }
  }
}
