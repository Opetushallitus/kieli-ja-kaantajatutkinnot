import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';

type Location = {
  lang: string;
  extraInformation: string;
  name: string;
  otherLocationInfo: string;
  streetAddress: string;
  postOffice: string;
  zip: string;
};

type Contact = {
  email: string;
};

export interface ClerkRegistration {
  examDate: Dayjs;
}

export interface ClerkExamSessionResponse
  extends Omit<
    ClerkExamSession,
    | 'publishedAt'
    | 'date'
    | 'registrationStartDate'
    | 'registrationEndDate'
    | 'availableRegistrationKind'
  > {
  publishedAt: string;
  date: string;
  registrationStartDate: string;
  registrationEndDate: string;
  availableRegistrationKind: string;
}

export interface ClerkExamSession {
  language: ExamLanguage;
  level: ExamLevel;
  open: boolean;
  upcomingAdmission: boolean;
  participants: number;
  maxParticipants: number;
  queue: number;
  contact: Array<Contact>;
  officeOid: string;
  publishedAt: Dayjs;
  date: Dayjs;
  organizerOid: string;
  id: number;
  registrationStartDate: Dayjs;
  location: Array<Location>;
  examFee: number;
  registrationEndDate: Dayjs;
  availableRegistrationKind: RegistrationKind;
  registrations: Array<ClerkRegistration>;
}
