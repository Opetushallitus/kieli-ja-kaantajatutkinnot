import { Dayjs } from 'dayjs';

import { ExamLevel } from 'enums/app';

/**
 * A person that is inspected in the quarantine - domain/context.
 * Can be quarantined person, or the person, whose information was set in the registration form. They can be also the same person.
 */
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
