import { Dayjs } from 'dayjs';

export type RegistrationState =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPPLEMENT_REQUESTED'
  | 'SUPPLEMENT_REQUEST_ANSWERED'
  | 'SUPPLEMENT_REQUEST_EXPIRED';

interface ClerkRegistrationPerson {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  oid: string;
}

export interface ClerkRegistrationResponse
  extends Omit<ClerkRegistration, 'examDate'> {
  examDate: string;
}

interface ClerkRegistration {
  id: number;
  person: ClerkRegistrationPerson;
  examDate: Dayjs;
  state: RegistrationState;
  kind: string;
}
