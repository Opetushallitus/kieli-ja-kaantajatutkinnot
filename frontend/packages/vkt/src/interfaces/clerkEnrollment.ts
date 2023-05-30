import { Dayjs } from 'dayjs';

import { EnrollmentStatus } from 'enums/app';
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

export interface ClerkPaymentLink {
  url: string;
  expires: Dayjs;
}

export interface ClerkPaymentLinkResponse
  extends Omit<ClerkPaymentLink, 'expires'> {
  expires: string;
}

export interface ClerkPayment extends WithId {
  id: number;
  version: number;
  paymentId: string;
  amount: number;
  status: string;
  modifiedAt: Dayjs;
}

export interface ClerkPaymentResponse extends Omit<ClerkPayment, 'modifiedAt'> {
  modifiedAt: string;
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
  payments: ClerkPayment[];
}

export interface ClerkEnrollmentResponse
  extends Omit<ClerkEnrollment, 'enrollmentTime' | 'payments'> {
  enrollmentTime: string;
  payments: ClerkPaymentResponse[];
}

export interface ClerkEnrollmentStatusChange extends WithId, WithVersion {
  newStatus: EnrollmentStatus;
}

export interface ClerkEnrollmentMove extends WithId, WithVersion {
  toExamEventId: number;
}
