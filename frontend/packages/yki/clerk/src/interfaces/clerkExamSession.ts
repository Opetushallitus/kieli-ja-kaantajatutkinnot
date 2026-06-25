import { Dayjs } from 'dayjs';

import {
  ExamLanguage,
  ExamLevel,
  ExamSessionType,
  RegistrationKind,
} from 'enums/app';
import {
  ClerkRegistration,
  ClerkRegistrationResponse,
} from 'interfaces/clerkRegistration';

type Location = {
  lang: string;
  extraInformation: string;
  name: string;
  otherLocationInfo: string;
  streetAddress: string;
  postOffice: string;
  zip: string;
};

export interface ClerkExamSessionResponse extends Omit<
  ClerkExamSession,
  | 'publishedAt'
  | 'date'
  | 'registrationStartDate'
  | 'registrationEndDate'
  | 'availableRegistrationKind'
  | 'registrations'
> {
  publishedAt: string;
  date: string;
  registrationStartDate: string;
  registrationEndDate: string;
  availableRegistrationKind: string;
  registrations: Array<ClerkRegistrationResponse>;
}

export interface ClerkExamSession {
  language: ExamLanguage;
  level: ExamLevel;
  type: ExamSessionType;
  open: boolean;
  upcomingAdmission: boolean;
  participants: number;
  participantsReadListen: number;
  participantsSpeakWrite: number;
  maxParticipantsTotal: number;
  maxParticipantsReadListen: number;
  maxParticipantsSpeakWrite: number;
  startTimeReadListen: string;
  startTimeSpeakWrite: string;
  queue: number;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
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
