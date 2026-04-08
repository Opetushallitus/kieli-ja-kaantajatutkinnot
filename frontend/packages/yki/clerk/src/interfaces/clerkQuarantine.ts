import { Dayjs } from 'dayjs';

type RegistrantForm = {
  firstName: string;
  lastName: string;
  birthdate?: string;
  ssn?: string;
  email: string;
  phoneNumber: string;
};

export type ClerkQuarantineMatchResponse = {
  id: number;
  birthdate: string;
  ssn: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationId: number;
  form: RegistrantForm;
  state: string;
  examDate: string;
  languageCode: string;
};

export type ClerkQuarantineMatch = {
  quarantineId: number;
  registrationId: number;
  examLanguageCode: string;
  examDate: Dayjs;
  quarantinedPerson: {
    firstName: string;
    lastName: string;
    birthdate: string;
    ssn: string;
    email: string;
    phoneNumber: string;
  };
  registrantForm: RegistrantForm;
};

export type ClerkQuarantineMatchesResponse = {
  quarantineMatches: ClerkQuarantineMatchResponse[];
};

export type ClerkQuarantineSort = 'examDate:asc' | 'examDate:desc';
