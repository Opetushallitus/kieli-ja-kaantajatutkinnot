import {
  CertificateLanguage,
  InstructionLanguage,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';
import { PartialExamType } from 'interfaces/publicRegistration';

export interface RegistrationContext {
  exam_session: ExamSessionResponse;
  registration_id: number;
  partial_exam_type: PartialExamType;
  registration_kind: RegistrationKind;
  user: {
    first_name?: string;
    last_name?: string;
    nick_name?: string;
    ssn?: string;
    post_office?: string;
    zip?: string;
    street_address?: string;
    email?: string;
    nationalities?: Array<string>;
    oid?: string;
    'external-user-id'?: string;
  };
  is_strongly_identified: boolean;
  expires_in?: number;
  state: RegistrationStates;
  reservation_expires_at: string | null;
  is_free: boolean;
  payment: {
    url: string;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
  } | null;
}

export interface RegistrationSubmitRequest {
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  nationalities: Array<string>;
  nationality_desc?: string;
  native_language?: string;
  certificate_lang?: CertificateLanguage | '';
  exam_lang?: InstructionLanguage | '';
  birthdate?: string;
  ssn?: string;
  zip?: string;
  post_office?: string;
  street_address?: string;
  phone_number?: string;
  email?: string;
  gender: string;
  country_code?: string;
  lang: string;
  free_registration_id?: number;
}

export interface RegistrationKey {
  examSessionId: number;
  registrationId: number;
}
