import { Dayjs } from 'dayjs';

import { RegistrationStates } from 'enums/app';

interface ClerkRegistrationPerson {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  oid: string;
  email: string;
  phoneNumber: string;
  zip: string;
  postOffice: string;
  streetAddress: string;
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
