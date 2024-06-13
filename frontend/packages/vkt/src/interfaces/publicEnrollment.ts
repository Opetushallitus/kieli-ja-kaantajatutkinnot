import { Dayjs } from 'dayjs';

import { EnrollmentStatus } from 'enums/app';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  PublicFreeEnrollmentBasis,
  PublicFreeEnrollmentDetails,
} from 'interfaces/publicEducation';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { WithId } from 'interfaces/with';

export interface PublicReservation extends WithId {
  expiresAt: Dayjs;
  renewedAt?: Dayjs;
  createdAt: Dayjs;
  isRenewable: boolean;
}

export interface PublicReservationResponse
  extends Omit<PublicReservation, 'expiresAt' | 'renewedAt' | 'createdAt'> {
  expiresAt: string;
  renewedAt?: string;
  createdAt: string;
}

export interface PublicReservationDetailsResponse {
  examEvent: PublicExamEventResponse;
  person: PublicPerson;
  reservation?: PublicReservationResponse;
  enrollment?: PublicEnrollmentResponse;
  freeEnrollmentDetails?: PublicFreeEnrollmentDetails;
}

export interface PublicEnrollmentContactDetails {
  email: string;
  emailConfirmation: string;
  phoneNumber: string;
}

export interface PublicEnrollment
  extends PublicEnrollmentContactDetails,
    PartialExamsAndSkills,
    CertificateShippingData {
  id?: number;
  hasPreviousEnrollment?: boolean;
  previousEnrollment?: string;
  privacyStatementConfirmation: boolean;
  status?: EnrollmentStatus;
  examEventId?: number;
  hasPaymentLink?: boolean;
  isFree?: boolean;
  feeEnrollmentBasis?: PublicFreeEnrollmentBasis;
}

export interface PublicEnrollmentResponse
  extends Omit<
      PublicEnrollment,
      | 'emailConfirmation'
      | 'id'
      | 'hasPreviousEnrollment'
      | 'privacyStatementConfirmation'
      | 'status'
    >,
    WithId {
  status: EnrollmentStatus;
}
