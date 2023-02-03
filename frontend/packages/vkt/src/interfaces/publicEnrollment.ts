import { Dayjs } from 'dayjs';

import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { WithId } from 'interfaces/with';

export interface PublicReservation extends WithId {
  expiresAt: Dayjs;
  expiresUpdatedAt: Dayjs;
  canRenew: boolean;
}

export interface PublicReservationDetails {
  person: PublicPerson;
  examEvent: PublicExamEvent;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

export interface PublicReservationResponse
  extends Omit<PublicReservation, 'expiresAt' | 'expiresUpdatedAt'> {
  expiresAt: string;
  expiresUpdatedAt: string;
  canRenew: boolean;
}

export interface PublicReservationDetailsResponse
  extends Omit<PublicReservationDetails, 'examEvent' | 'reservation'> {
  examEvent: PublicExamEventResponse;
  reservation?: PublicReservationResponse;
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
  previousEnrollment?: string;
  privacyStatementConfirmation: boolean;
}
