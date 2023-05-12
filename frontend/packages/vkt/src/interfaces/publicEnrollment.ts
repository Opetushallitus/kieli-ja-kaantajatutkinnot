import { Dayjs } from 'dayjs';

import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import { PublicPerson, PublicPersonResponse } from 'interfaces/publicPerson';
import { WithId } from 'interfaces/with';

export interface PublicReservation extends WithId {
  expiresAt: Dayjs;
  renewedAt?: Dayjs;
  createdAt: Dayjs;
  isRenewable: boolean;
}

export interface PublicReservationDetails {
  person: PublicPerson;
  examEvent: PublicExamEvent;
  reservation?: PublicReservation; // undefined if enrolling to queue
}

export interface PublicReservationResponse
  extends Omit<PublicReservation, 'expiresAt' | 'renewedAt' | 'createdAt'> {
  expiresAt: string;
  renewedAt?: string;
  createdAt: string;
}

export interface PublicReservationDetailsResponse
  extends Omit<
    PublicReservationDetails,
    'examEvent' | 'reservation' | 'person'
  > {
  examEvent: PublicExamEventResponse;
  reservation?: PublicReservationResponse;
  person: PublicPersonResponse;
  enrollment?: PublicEnrollment;
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
  previousEnrollment?: string;
  hasPreviousEnrollment?: boolean;
  privacyStatementConfirmation: boolean;
}
