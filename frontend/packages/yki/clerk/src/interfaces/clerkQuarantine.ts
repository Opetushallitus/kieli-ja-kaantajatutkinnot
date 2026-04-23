import { Dayjs } from 'dayjs';

import { ExamLevel } from 'enums/app';

type ClerkQuarantinePerson = {
  firstName: string;
  lastName: string;
  birthdate?: string;
  ssn?: string;
  email: string;
  phoneNumber: string;
};

export type ClerkQuarantineMatchResponse = {
  id: number;
  quarantinedPerson: ClerkQuarantinePerson;
  registrant: ClerkQuarantinePerson;
  registrationId: number;
  state: string;
  examDate: string;
  languageCode: string;
  levelCode: keyof typeof ExamLevel;
};

export type ClerkQuarantineMatch = {
  quarantineId: number;
  registrationId: number;
  examLanguageCode: string;
  examLevelCode: keyof typeof ExamLevel;
  examDate: Dayjs;
  quarantinedPerson: ClerkQuarantinePerson;
  registrant: ClerkQuarantinePerson;
};

export type ClerkQuarantineSort = 'examDate:asc' | 'examDate:desc';
