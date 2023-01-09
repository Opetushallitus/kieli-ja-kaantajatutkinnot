import { Dayjs } from 'dayjs';

import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { WithId } from 'interfaces/with';

interface PublicReservation extends WithId {
  expiresAt: Dayjs;
}

export interface PublicReservationDetails {
  person: PublicPerson;
  examEvent: PublicExamEvent;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

interface PublicReservationResponse
  extends Omit<PublicReservation, 'expiresAt'> {
  expiresAt: string;
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

export interface PublicEnrollmentAddress {
  street: string;
  postalCode: string;
  town: string;
  country: string;
}

export interface PublicEnrollment
  extends PublicEnrollmentContactDetails,
    PartialExamsAndSkills,
    PublicEnrollmentAddress {
  digitalCertificateConsent: boolean;
  privacyStatementConfirmation: boolean;
}
