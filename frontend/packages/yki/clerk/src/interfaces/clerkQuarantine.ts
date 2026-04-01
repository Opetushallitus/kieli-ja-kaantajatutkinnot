import { Dayjs } from 'dayjs';

export interface RegistrationForm {
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  ssn?: string;
  email?: string;
  phone_number?: string;
  [key: string]: unknown;
}

export type ClerkQuarantineMatchResponse = {
  id: number;
  birthdate: string;
  ssn: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationId: number;
  form: RegistrationForm;
  state: string;
  examDate: string;
  languageCode: string;
};

export type ClerkQuarantineMatchesResponse = {
  quarantineMatches: ClerkQuarantineMatchResponse[];
};

export type QuarantinePersonData = {
  firstName: string;
  lastName: string;
  birthdate: string;
  ssn: string;
  email: string;
  phoneNumber: string;
};

export type ClerkQuarantineMatch = {
  quarantineId: number;
  registrationId: number;
  examLanguageCode: string;
  examDate: Dayjs;
  ban: QuarantinePersonData;
  registrant: QuarantinePersonData;
};

export type ClerkQuarantineSort = 'examDate:asc' | 'examDate:desc';
