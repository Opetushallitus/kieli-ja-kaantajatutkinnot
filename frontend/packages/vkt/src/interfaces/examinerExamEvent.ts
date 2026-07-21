import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';
import { WithId, WithVersion } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentResponse,
} from 'interfaces/clerkEnrollment';
import { MunicipalityCode } from 'interfaces/municipality';

export interface ExaminerExamEventResponse extends Omit<
  ExaminerExamEvent,
  'date' | 'registrationCloses' | 'enrollments'
> {
  date: string;
  registrationCloses: string;
  enrollments: Array<ClerkEnrollmentAppointmentResponse>;
}

export interface ExaminerExamEvent extends WithId, WithVersion {
  date: Dayjs;
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  municipality: MunicipalityCode;
  isHidden: boolean;
  location?: string;
  examTime?: string;
  otherInformation?: string;
  maxParticipants?: number;
  registrationCloses?: Dayjs;
  enrollments: Array<ClerkEnrollmentAppointment>;
}

export interface ExaminerExamEventUpsert extends Omit<
  ExaminerExamEvent,
  'id' | 'version' | 'enrollments'
> {
  id?: number;
}

export interface ExaminerExamEventUpsertState {
  status: APIResponseStatus;
  examEvent: Partial<ExaminerExamEventUpsert>;
}
