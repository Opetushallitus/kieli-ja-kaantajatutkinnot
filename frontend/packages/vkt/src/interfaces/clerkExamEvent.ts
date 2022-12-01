import { Dayjs } from 'dayjs';

import { EnrollmentStatus, ExamLanguage, ExamLevel } from 'enums/app';
import { WithId, WithVersion } from 'interfaces/with';

interface Person {
  identityNumber: string;
  lastName: string;
  firstName: string;
}

export interface ClerkExamEventEnrollmentResponse
  extends Partial<WithId>,
    Partial<WithVersion>,
    Omit<Enrollment, 'previousEnrollmentDate'> {
  previousEnrollmentDate: string;
}

export interface Enrollment {
  person: Person;
  oralSkill: boolean;
  textualSkill: boolean;
  understandingSkill: boolean;
  speakingPartialExam: boolean;
  speechComprehensionPartialExam: boolean;
  writingPartialExam: boolean;
  readingComprehensionPartialExam: boolean;
  status: EnrollmentStatus;
  previousEnrollmentDate: Dayjs;
  digitalCertificateConsent: boolean;
  email: string;
  phoneNumber: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
}

export interface ClerkExamEventBasicInformation {
  language: Exclude<ExamLanguage, 'ALL'>;
  level: ExamLevel;
  date: Dayjs;
  registrationCloses: Dayjs;
  participants: number;
  maxParticipants: number;
  isHidden: boolean;
}

export interface DraftClerkExamEvent
  extends Omit<
    ClerkExamEvent,
    | 'id'
    | 'version'
    | 'language'
    | 'level'
    | 'date'
    | 'participants'
    | 'maxParticipants'
    | 'registrationCloses'
    | 'enrollments'
  > {
  language?: Exclude<ExamLanguage, ExamLanguage.ALL>;
  level?: ExamLevel;
  date?: Dayjs;
  registrationCloses?: Dayjs;
  maxParticipants?: number;
}

export interface ClerkExamEventResponse
  extends Omit<ClerkExamEvent, 'date' | 'registrationCloses' | 'enrollments'> {
  date: string;
  registrationCloses: string;
  enrollments: Array<ClerkExamEventEnrollmentResponse>;
}

export interface ClerkExamEvent
  extends WithId,
    WithVersion,
    ClerkExamEventBasicInformation {
  enrollments: Array<Enrollment>;
}
