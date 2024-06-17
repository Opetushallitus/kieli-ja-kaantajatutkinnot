import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { EnrollmentStatus, PaymentStatus } from 'enums/app';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import { PublicFreeEnrollmentBasis } from 'interfaces/publicEducation';

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

export interface ClerkEnrollment
  extends WithId,
    WithVersion,
    PartialExamsAndSkills,
    CertificateShippingData {
  enrollmentTime: Dayjs;
  person: ClerkPerson;
  status: EnrollmentStatus;
  previousEnrollment?: string;
  email: string;
  phoneNumber: string;
  payments: Array<ClerkPayment>;
  freeEnrollmentBasis?: PublicFreeEnrollmentBasis;
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
