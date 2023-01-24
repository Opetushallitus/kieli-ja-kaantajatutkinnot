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

export interface ClerkEnrollmentResponse
  extends Omit<ClerkEnrollment, 'enrollmentTime'> {
  enrollmentTime: string;
}

export interface ClerkEnrollmentStatusChange extends WithId, WithVersion {
  newStatus: EnrollmentStatus;
}

export interface ClerkEnrollmentMove extends WithId, WithVersion {
  toExamEventId: number;
}
