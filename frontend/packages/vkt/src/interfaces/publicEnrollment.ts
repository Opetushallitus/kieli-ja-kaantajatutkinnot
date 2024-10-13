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

interface PublicEnrollmentCommon
  extends PublicEnrollmentContactDetails,
    PartialExamsAndSkills {
  id?: number;
  hasPreviousEnrollment?: boolean;
  previousEnrollment?: string;
  privacyStatementConfirmation: boolean;
  status?: EnrollmentStatus;
}

export interface PublicEnrollment
  extends PublicEnrollmentCommon,
    CertificateShippingData {
  examEventId?: number;
  hasPaymentLink?: boolean;
  isFree?: boolean;
  freeEnrollmentBasis?: PublicFreeEnrollmentBasis;
  isQueued?: boolean;
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

export interface PublicEnrollmentAppointment
  extends PublicEnrollmentCommon,
    CertificateShippingData {
  person: PublicPerson;
}

export interface PublicEnrollmentContact extends PublicEnrollmentCommon {}

export interface PublicEnrollmentAppointmentResponse
  extends Omit<
      PublicEnrollmentAppointment,
      | 'emailConfirmation'
      | 'id'
      | 'hasPreviousEnrollment'
      | 'privacyStatementConfirmation'
      | 'status'
    >,
    WithId {
  status: EnrollmentStatus;
}
