import { Dayjs } from 'dayjs';

import { EnrollmentStatus, ExamLanguage, ExamLevel } from 'enums/app';
import { WithId, WithVersion } from 'interfaces/with';

interface Person extends WithId, WithVersion {
  identityNumber: string;
  lastName: string;
  firstName: string;
}

export interface ClerkEnrollmentResponse
  extends Omit<ClerkEnrollment, 'enrollmentTime' | 'previousEnrollmentDate'> {
  enrollmentTime: string;
  previousEnrollmentDate?: string;
}

export interface PartialExamsAndSkills {
  oralSkill: boolean;
  textualSkill: boolean;
  understandingSkill: boolean;
  speakingPartialExam: boolean;
  speechComprehensionPartialExam: boolean;
  writingPartialExam: boolean;
  readingComprehensionPartialExam: boolean;
}

export interface ClerkEnrollment
  extends PartialExamsAndSkills,
    WithId,
    WithVersion {
  enrollmentTime: Dayjs;
  person: Person;
  status: EnrollmentStatus;
  previousEnrollmentDate?: Dayjs;
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
  isHidden: boolean;
  maxParticipants: number;
}

export interface ClerkExamEventResponse
  extends Omit<ClerkExamEvent, 'date' | 'registrationCloses' | 'enrollments'> {
  date: string;
  registrationCloses: string;
  enrollments: Array<ClerkEnrollmentResponse>;
}

export interface ClerkExamEvent
  extends WithId,
    WithVersion,
    ClerkExamEventBasicInformation {
  enrollments: Array<ClerkEnrollment>;
}
