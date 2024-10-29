import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { EnrollmentStatus, PaymentStatus } from 'enums/app';
import { ClerkFreeEnrollmentBasis } from 'interfaces/clerkEducation';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';

interface ClerkPerson extends WithId, WithVersion {
  lastName: string;
  firstName: string;
}

export interface ClerkPaymentLink {
  url: string;
  expiresAt: Dayjs;
}

export interface ClerkPaymentLinkResponse
  extends Omit<ClerkPaymentLink, 'expiresAt'> {
  expiresAt: string;
}

export interface ClerkPayment extends WithId, WithVersion {
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Dayjs;
  refundedAt?: Dayjs;
}

export interface ClerkPaymentResponse
  extends Omit<ClerkPayment, 'createdAt' | 'refundedAt'> {
  createdAt: string;
  refundedAt?: string;
}

interface ClerkEnrollmentCommon
  extends WithId,
    WithVersion,
    PartialExamsAndSkills,
    CertificateShippingData {
  enrollmentTime: Dayjs;
  previousEnrollment?: string;
  email: string;
  phoneNumber: string;
}

export interface ClerkEnrollment extends ClerkEnrollmentCommon {
  status: EnrollmentStatus;
  payments: Array<ClerkPayment>;
  isFree?: boolean;
  freeEnrollmentBasis?: ClerkFreeEnrollmentBasis;
  freeEnrollmentDetails?: PublicFreeEnrollmentDetails;
  person: ClerkPerson;
}

export interface ClerkEnrollmentResponse
  extends Omit<ClerkEnrollment, 'enrollmentTime' | 'payments'> {
  enrollmentTime: string;
  payments: Array<ClerkPaymentResponse>;
}

export interface ClerkEnrollmentStatusChange extends WithId, WithVersion {
  newStatus: EnrollmentStatus;
}

export interface ClerkEnrollmentMove extends WithId, WithVersion {
  toExamEventId: number;
}

export interface ClerkEnrollmentContact extends ClerkEnrollmentCommon {
  status: EnrollmentStatus;
  firstName: string;
  lastName: string;
}

export interface ClerkEnrollmentContactResponse
  extends Omit<ClerkEnrollmentContact, 'enrollmentTime'> {
  enrollmentTime: string;
}

export interface ClerkEnrollmentAppointment extends ClerkEnrollmentContact {
  payments: Array<ClerkPayment>;
  person?: ClerkPerson;
}

export interface ClerkEnrollmentAppointmentResponse
  extends Omit<ClerkEnrollmentAppointment, 'enrollmentTime'> {
  enrollmentTime: string;
}
