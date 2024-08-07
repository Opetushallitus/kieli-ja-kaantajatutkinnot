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
    | 'unApprovedFreeEnrollments'
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
  unApprovedFreeEnrollments: number;
}
