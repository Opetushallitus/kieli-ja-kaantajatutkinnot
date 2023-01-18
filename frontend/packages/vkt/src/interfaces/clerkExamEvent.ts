import { Dayjs } from 'dayjs';

import { EnrollmentStatus, ExamLanguage, ExamLevel } from 'enums/app';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import { WithId, WithVersion } from 'interfaces/with';

interface Person extends WithId, WithVersion {
  identityNumber: string;
  lastName: string;
  firstName: string;
}

export interface ClerkEnrollmentResponse
  extends Omit<ClerkEnrollment, 'enrollmentTime'> {
  enrollmentTime: string;
}

export interface ClerkEnrollment
  extends WithId,
    WithVersion,
    PartialExamsAndSkills,
    CertificateShippingData {
  enrollmentTime: Dayjs;
  person: Person;
  status: EnrollmentStatus;
  previousEnrollment?: string;
  email: string;
  phoneNumber: string;
}

export interface ClerkExamEventBasicInformation {
  language: Exclude<ExamLanguage, 'ALL'>;
  level: ExamLevel;
  date: Dayjs;
  registrationCloses: Dayjs;
  isHidden: boolean;
  maxParticipants: number;
}

export interface DraftClerkExamEvent
  extends Omit<
    ClerkExamEvent,
    | 'id'
    | 'version'
    | 'language'
    | 'level'
    | 'date'
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
  enrollments: Array<ClerkEnrollmentResponse>;
}

export interface ClerkExamEvent
  extends WithId,
    WithVersion,
    ClerkExamEventBasicInformation {
  enrollments: Array<ClerkEnrollment>;
}

export interface ClerkEnrollmentStatusChange {
  id: number;
  version: number;
  newStatus: EnrollmentStatus;
}
