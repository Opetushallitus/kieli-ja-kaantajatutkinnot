import { Dayjs } from 'dayjs';

import { EnrollmentAppointmentStatus, EnrollmentStatus } from 'enums/app';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  Attachment,
  PublicFreeEnrollmentBasis,
  PublicFreeEnrollmentDetails,
} from 'interfaces/publicEducation';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import {
  PublicExaminerExamEvent,
  PublicExaminerExamEventResponse,
} from 'interfaces/publicExaminerExamEvent';
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

export interface PublicEnrollmentContactRequestDetails {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmation: string;
  phoneNumber: string;
}

export interface PublicEnrollmentCommon extends PublicEnrollmentContactDetails {
  id?: number;
  hasPreviousEnrollment?: boolean;
  privacyStatementConfirmation: boolean;
  status?: EnrollmentStatus;
}

export interface PublicEnrollment
  extends PublicEnrollmentCommon,
    CertificateShippingData,
    PartialExamsAndSkills {
  examEventId?: number;
  hasPaymentLink?: boolean;
  isFree?: boolean;
  freeEnrollmentBasis?: PublicFreeEnrollmentBasis;
  isQueued?: boolean;
  previousEnrollment?: string;
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

export interface PublicEnrollmentContact extends PublicEnrollmentCommon {
  firstName: string;
  lastName: string;
  message: string;
  isFullExam?: boolean;
  partialExamSelection?: string;
  attachments?: Array<Attachment>;
}

export interface PublicEnrollmentAppointment
  extends Omit<
      PublicEnrollmentContact,
      'firstName' | 'lastName' | 'message' | 'status'
    >,
    CertificateShippingData,
    PartialExamsAndSkills {
  status?: EnrollmentAppointmentStatus;
  person?: PublicPerson;
  previousEnrollment?: string;
  examEvent?: Pick<
    PublicExaminerExamEvent,
    'date' | 'examTime' | 'municipality' | 'location' | 'language' | 'examiner'
  >;
}

export interface PublicEnrollmentAppointmentResponse
  extends Omit<
      PublicEnrollmentAppointment,
      | 'emailConfirmation'
      | 'id'
      | 'hasPreviousEnrollment'
      | 'privacyStatementConfirmation'
      | 'examEvent'
    >,
    WithId {
  examEvent: Pick<
    PublicExaminerExamEventResponse,
    'date' | 'examTime' | 'municipality' | 'location' | 'language' | 'examiner'
  >;
}
