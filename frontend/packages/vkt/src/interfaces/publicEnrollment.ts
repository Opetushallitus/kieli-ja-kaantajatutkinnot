import { Dayjs } from 'dayjs';

import { EnrollmentStatus } from 'enums/app';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { PublicPersonResponse } from 'interfaces/publicPerson';
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
  person: PublicPersonResponse;
  reservation?: PublicReservationResponse;
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
  status?: EnrollmentStatus;
}
