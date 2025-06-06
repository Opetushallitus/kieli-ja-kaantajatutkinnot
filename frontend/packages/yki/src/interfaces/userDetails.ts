import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage, ExamLevel, RegistrationStates } from 'enums/app';
import { ExamSessionLocation } from 'interfaces/examSessions';

export interface PersonRegistrations extends WithId {
  state: RegistrationStates;
  examSessionId: string;
  examLang: ExamLanguage;
  examLevel: ExamLevel;
  examDate: Dayjs;
  location: Array<ExamSessionLocation>;
  isTransferable: boolean;
  isTransfered: boolean;
  isCancellable: boolean;
  paidAt?: Dayjs;
  expiresAt?: Dayjs;
  examFee?: number;
}

interface PersonRegistrationsResponse extends WithId {
  exam_session_id: string;
  language_code: string;
  level_code: string;
  state: string;
  exam_date: string;
  location: Array<ExamSessionLocation>;
  is_transfered: boolean;
  is_transferable: boolean;
  is_cancellable: boolean;
  paid_at?: string;
  expires_at?: string;
  exam_fee?: number;
}

export interface PersonDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  postOffice: string;
  zip: string;
  registrations: Array<PersonRegistrations>;
}

export interface PersonDetailsResponse {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street_address: string;
  post_office: string;
  zip: string;
  registrations: Array<PersonRegistrationsResponse>;
}

export interface CancelRegistrationResponse {
  success: boolean;
}
