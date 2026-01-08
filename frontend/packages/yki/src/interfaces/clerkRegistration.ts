import { Dayjs } from 'dayjs';

import { RegistrationStates } from 'enums/app';

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

export type ClerkRegistration = {
  id: number;
  person: ClerkRegistrationPerson;
  examDate: Dayjs;
  state: RegistrationStates;
  kind: string;
};
