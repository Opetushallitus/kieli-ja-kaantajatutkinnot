import { Dayjs } from 'dayjs';

import { ExamLevel, RegistrationStates } from 'enums/app';

type LanguageLevelCode = 'PERUS' | 'KESKI' | 'YLIN';

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
  examLanguageCode: LanguageLevelCode;
  examLevelCode: keyof typeof ExamLevel;
  examDate: Dayjs;
  state: RegistrationStates;
  quarantinedPerson: ClerkQuarantinePerson;
  registrant: ClerkQuarantinePerson;
};

export type ClerkQuarantineReviewResponse = {
  id: number;
  quarantined: boolean;
  quarantineId: number;
  registrationId: number;
  updated: string;
  examDate: string;
  languageCode: string;
  levelCode: keyof typeof ExamLevel;
  state: string;
  quarantinedPerson: ClerkQuarantinePerson;
  registrant: ClerkQuarantinePerson;
};

export type ClerkQuarantineReview = {
  id: number;
  quarantined: boolean;
  quarantineId: number;
  registrationId: number;
  updated: Dayjs;
  examDate: Dayjs;
  examLanguageCode: LanguageLevelCode;
  examLevelCode: keyof typeof ExamLevel;
  state: RegistrationStates;
  quarantinedPerson: ClerkQuarantinePerson;
  registrant: ClerkQuarantinePerson;
};

export type ClerkQuarantineSort = 'examDate:asc' | 'examDate:desc';

export type ClerkActiveQuarantineResponse = {
  id: number;
  startDate: string;
  endDate: string;
  languageCode: string;
  quarantinedPerson: ClerkQuarantinePerson;
};

export type ClerkActiveQuarantine = {
  id: number;
  startDate: Dayjs;
  endDate: Dayjs;
  languageCode: string;
  quarantinedPerson: ClerkQuarantinePerson;
};

export type ActiveQuarantinesSort = 'startDate:asc' | 'startDate:desc';

export type CreateClerkQuarantineRequest = {
  firstName: string;
  lastName: string;
  birthdate?: string;
  ssn?: string;
  email?: string;
  phoneNumber?: string;
  languageCode: string;
  startDate: string;
  endDate: string;
  diaryNumber: string;
};
