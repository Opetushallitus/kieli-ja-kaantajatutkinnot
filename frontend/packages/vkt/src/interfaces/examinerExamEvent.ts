import { Dayjs } from "dayjs";
import { ExamLanguage } from "enums/app";
import { WithId, WithVersion } from "shared/interfaces";
import { MunicipalityCode } from "./municipality";
import { ClerkEnrollmentAppointment, ClerkEnrollmentAppointmentResponse } from "./clerkEnrollment";

export interface ExaminerExamEventResponse
  extends Omit<
    ExaminerExamEvent,
    'date' | 'registrationCloses' | 'enrollments'
  > {
  date: string;
  registrationCloses: string;
  enrollments: Array<ClerkEnrollmentAppointmentResponse>;
}

export interface ExaminerExamEvent
  extends WithId,
    WithVersion {
  date: Dayjs;
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  municipality: MunicipalityCode;
  location: string;
  isHidden: boolean;
  maxParticipants?: number;
  registrationCloses?: Dayjs;
  enrollments: Array<ClerkEnrollmentAppointment>;
}
