import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import {
  ExamLanguage,
  ExamLevel,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { ExamSessionLocation, ExamSessionType } from 'interfaces/examSessions';
import { PartialExamType } from 'interfaces/publicRegistration';

export interface PersonRegistrations extends WithId {
  state: RegistrationStates;
  kind: RegistrationKind;
  examSessionId: string;
  examLang: ExamLanguage;
  examLevel: ExamLevel;
  examDate: Dayjs;
  registrationStartDate: Dayjs;
  registrationEndDate: Dayjs;
  location: Array<ExamSessionLocation>;
  isTransfered: boolean;
  isCancellable: boolean;
  paidAt?: Dayjs;
  expiresAt?: Dayjs;
  examFee?: number;
  liftedFromQueueAt?: Dayjs;
  positionInQueue?: number;
  isFreeRegistration?: boolean;
  partialExamType: PartialExamType;
  type: ExamSessionType;
}

interface PersonRegistrationsResponse extends WithId {
  partial_exam_type: PartialExamType;
  type: ExamSessionType;
  exam_session_id: string;
  language_code: string;
  level_code: string;
  state: string;
  kind: string;
  exam_date: string;
  registration_start_date: string;
  registration_end_date: string;
  location: Array<ExamSessionLocation>;
  is_transfered: boolean;
  is_cancellable: boolean;
  paid_at?: string;
  expires_at?: string;
  exam_fee?: number;
  lifted_from_queue_at?: string;
  position_in_queue?: number;
  is_free_registration?: boolean;
}

export interface PersonDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  postOffice: string;
  zip: string;
  countryCode?: string;
  registrations: Array<PersonRegistrations>;
}

export interface ModifyContactDetails
  extends Pick<
    PersonDetails,
    | 'email'
    | 'phoneNumber'
    | 'postOffice'
    | 'streetAddress'
    | 'zip'
    | 'countryCode'
  > {
  confirmEmail: string;
}

export interface PersonDetailsResponse {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street_address: string;
  post_office: string;
  zip: string;
  country_code?: string;
  registrations: Array<PersonRegistrationsResponse>;
}

export interface CancelRegistrationResponse {
  success: boolean;
}

export interface ModifyContactDetailsResponse {
  success: boolean;
}
