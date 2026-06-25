import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import {
  EnrollmentAppointmentStatus,
  EnrollmentStatus,
  PaymentStatus,
} from 'enums/app';
import { ClerkFreeEnrollmentBasis } from 'interfaces/clerkEducation';
import {
  CertificateShippingData,
  PartialExams,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  ExaminerExamEvent,
  ExaminerExamEventResponse,
} from 'interfaces/examinerExamEvent';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';

interface ClerkPerson extends WithId, WithVersion {
  lastName: string;
  firstName: string;
  oid: string;
}

export interface ClerkPaymentLink {
  url: string;
  expiresAt: Dayjs;
}

export interface ClerkOnrBirthdate {
  birthdate: string;
  oid: string;
}

export interface ClerkOnrSsn {
  ssn: string;
  oid: string;
}

export interface ClerkPaymentLinkResponse extends Omit<
  ClerkPaymentLink,
  'expiresAt'
> {
  expiresAt: string;
}

export interface ClerkPayment extends WithId, WithVersion {
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Dayjs;
  refundedAt?: Dayjs;
}

export interface ClerkPaymentResponse extends Omit<
  ClerkPayment,
  'createdAt' | 'refundedAt'
> {
  createdAt: string;
  refundedAt?: string;
}

interface ClerkEnrollmentCommon
  extends WithId, WithVersion, CertificateShippingData {
  enrollmentTime: Dayjs;
  email: string;
  phoneNumber: string;
}

export interface ClerkEnrollment
  extends ClerkEnrollmentCommon, PartialExamsAndSkills {
  status: EnrollmentStatus;
  payments: Array<ClerkPayment>;
  isFree?: boolean;
  freeEnrollmentBasis?: ClerkFreeEnrollmentBasis;
  freeEnrollmentDetails?: PublicFreeEnrollmentDetails;
  person: ClerkPerson;
  previousEnrollment?: string;
}

export interface ClerkEnrollmentResponse extends Omit<
  ClerkEnrollment,
  'enrollmentTime' | 'payments'
> {
  enrollmentTime: string;
  payments: Array<ClerkPaymentResponse>;
}

export interface ClerkEnrollmentStatusChange extends WithId, WithVersion {
  newStatus: EnrollmentStatus;
}

export interface ClerkEnrollmentAppointmentMove extends ClerkEnrollmentMove {
  oid: string;
}

export interface ClerkEnrollmentMove extends WithId, WithVersion {
  toExamEventId: number;
}

export interface ClerkEnrollmentContact extends ClerkEnrollmentCommon {
  status: EnrollmentAppointmentStatus;
  firstName: string;
  lastName: string;
  isFullExam: boolean;
  hasPreviousEnrollment: boolean;
  partialExamSelection?: string;
  message: string;
}

export interface ClerkEnrollmentContactResponse extends Omit<
  ClerkEnrollmentContact,
  'enrollmentTime'
> {
  enrollmentTime: string;
}

export interface ClerkAuthLink {
  url: string;
  expiresAt: Dayjs;
  sentAt: Dayjs;
}

export interface ClerkAuthLinkResponse extends Omit<
  ClerkAuthLink,
  'expiresAt' | 'sentAt'
> {
  url: string;
  expiresAt: Dayjs;
  sentAt: Dayjs;
}

export interface ClerkEnrollmentAppointment
  extends
    Omit<ClerkEnrollmentContact, 'isFullExam' | 'partialExamSelection'>,
    PartialExamsAndSkills {
  payments: Array<ClerkPayment>;
  person?: ClerkPerson;
  authLink?: ClerkAuthLink;
  paymentLinkUrl?: string;
  examEvent?: ExaminerExamEvent;
  previousEnrollment?: string;
}

export interface ClerkEnrollmentAppointmentResponse extends Omit<
  ClerkEnrollmentAppointment,
  'enrollmentTime' | 'payments' | 'examEvent'
> {
  enrollmentTime: string;
  payments: Array<ClerkPaymentResponse>;
  examEvent?: ExaminerExamEventResponse;
}

export interface ClerkEnrollmentAppointmentHistory extends PartialExamsAndSkills {
  enrollmentTime: Dayjs;
  examEvent: ExaminerExamEvent;
  examinerName: string;
  grades: ClerkEnrollmentAppointmentGrades;
}

export interface ClerkEnrollmentAppointmentHistoryResponse extends Omit<
  ClerkEnrollmentAppointmentHistory,
  'enrollmentTime' | 'examEvent'
> {
  enrollmentTime: string;
  examEvent: ExaminerExamEventResponse;
}

interface Grade {
  grade: string;
  comment: string;
}

export interface GradedExams extends Omit<PartialExams, 'understandingSkill'> {}

export interface ClerkEnrollmentAppointmentGrades extends WithVersion {
  speakingPartialExam: Grade;
  speechComprehensionPartialExam: Grade;
  writingPartialExam: Grade;
  readingComprehensionPartialExam: Grade;
}
