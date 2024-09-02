import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  ClerkEnrollment,
  ClerkEnrollmentResponse,
} from 'interfaces/clerkEnrollment';
import { WithId, WithVersion } from 'interfaces/with';

export interface ClerkExamEventBasicInformation {
  language: Exclude<ExamLanguage, 'ALL'>;
  level: ExamLevel;
  date: Dayjs;
  registrationCloses: Dayjs;
  registrationOpens: Dayjs;
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
    | 'registrationOpens'
    | 'enrollments'
    | 'unApprovedFreeEnrollments'
  > {
  language?: Exclude<ExamLanguage, ExamLanguage.ALL>;
  level?: ExamLevel;
  date?: Dayjs;
  registrationCloses?: Dayjs;
  registrationOpens?: Dayjs;
  maxParticipants?: number;
}

export interface ClerkExamEventResponse
  extends Omit<
    ClerkExamEvent,
    'date' | 'registrationCloses' | 'registrationOpens' | 'enrollments'
  > {
  date: string;
  registrationCloses: string;
  registrationOpens: string;
  enrollments: Array<ClerkEnrollmentResponse>;
}

export interface ClerkExamEvent
  extends WithId,
    WithVersion,
    ClerkExamEventBasicInformation {
  enrollments: Array<ClerkEnrollment>;
  unApprovedFreeEnrollments: number;
}
