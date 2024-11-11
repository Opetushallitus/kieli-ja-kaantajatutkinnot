import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentResponse,
} from 'interfaces/clerkEnrollment';
import { MunicipalityCode } from 'interfaces/municipality';

export interface ExaminerExamEventResponse
  extends Omit<
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
  location: string;
  isHidden: boolean;
  maxParticipants?: number;
  registrationCloses?: Dayjs;
  enrollments: Array<ClerkEnrollmentAppointment>;
}
