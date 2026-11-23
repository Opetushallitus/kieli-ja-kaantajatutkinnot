import { Dayjs } from 'dayjs';

import { RegistrationStates } from 'enums/app';

interface ClerkRegistrationPerson {
  birthdate?: string | null;
  firstName: string;
  lastName: string;
  socialSecurityNumber?: string | null;
  oid: string;
  email: string;
  phoneNumber: string;
  zip: string;
  postOffice: string;
  streetAddress: string;
}

export interface ClerkRegistrationResponse extends Omit<
  ClerkRegistration,
  'registrationDate'
> {
  registrationDate: string;
}

export type ClerkRegistration = {
  id: number;
  person: ClerkRegistrationPerson;
  registrationDate: Dayjs;
  state: RegistrationStates;
  kind: string;
  partialExamType: string;
  queuePosition: number | null;
};
