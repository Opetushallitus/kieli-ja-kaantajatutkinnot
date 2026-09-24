import {
  CertificateLanguage,
  InstructionLanguage,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';
import { PartialExamType } from 'interfaces/publicRegistration';
import { SessionResponse } from 'interfaces/session';

// Wire contract for init, details GET and submission. See docs/yki-registration-v2-contract.md.
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
  // Compatibility only; the timer uses the absolute reservation deadline.
  expires_in?: number;
  state: RegistrationStates;
  session: SessionResponse;
  reservation_expires_at: string | null;
  is_free: boolean;
  authentication_urls: { suomifi: string; email: string };
  payment: {
    url: string;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
  } | null;
}

export interface RegistrationInitRequest {
  exam_session_id: number;
  to_queue: boolean;
  partial_exam_type: PartialExamType;
}

// Missing identity/form fields are omitted from JSON. Required fields depend on
// identification method; the contract document specifies those requirements.
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

export interface ConflictingRegistration {
  id: number;
  registration_id: number;
  state: RegistrationStates;
  partial_exam_type: PartialExamType;
  kind: RegistrationKind;
}

export interface RegistrationInitErrorResponse {
  error: {
    closed?: boolean;
    full?: boolean;
    partialFull?: boolean;
    'other-exam-session-registration'?: ConflictingRegistration;
  };
}

export interface RegistrationSubmitErrorResponse {
  error: {
    closed?: boolean;
    create_payment?: boolean;
    expired?: boolean;
    person_creation?: boolean;
    registered?: boolean;
  };
}
export type RegistrationStep = 'Identify' | 'Register' | 'Payment' | 'Done';
export interface RegistrationKey {
  examSessionId: number;
  registrationId: number;
}
