import { AxiosResponse } from 'axios';
import { WithId } from 'shared/interfaces';

import {
  CertificateLanguage,
  GenderEnum,
  InstructionLanguage,
} from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';

export interface PersonFillOutDetails {
  firstNames: string;
  lastName: string;
  address: string;
  postNumber: string;
  postOffice: string;
  phoneNumber: string;
  certificateLanguage: CertificateLanguage | '';
  instructionLanguage: InstructionLanguage | '';
  nationality: string;
}

export interface RegistrationCheckboxDetails {
  privacyStatementConfirmation: boolean;
  termsAndConditionsAgreed: boolean;
}

export interface PublicSuomiFiRegistration
  extends PersonFillOutDetails,
    RegistrationCheckboxDetails,
    WithId {
  email: string;
  emailConfirmation: string;
}

export interface PublicEmailRegistration
  extends Omit<PublicSuomiFiRegistration, 'emailConfirmation'> {
  dateOfBirth?: string;
  gender?: GenderEnum;
  hasSSN?: boolean;
  ssn?: string;
}

export interface PublicRegistrationInitResponse {
  exam_session: ExamSessionResponse;
  registration_id: number;
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
  };
  is_strongly_identified: boolean;
}

export interface PublicRegistrationInitErrorResponse {
  error: {
    closed?: boolean;
    full?: boolean;
    registered?: boolean;
  };
}

export function isRegistrationInitErrorResponse(
  response: AxiosResponse,
): response is AxiosResponse<PublicRegistrationInitErrorResponse> {
  const error = response.data.error;
  if (!error) {
    return false;
  }

  return 'closed' in error || 'full' in error || 'exists' in error;
}

export interface PublicRegistrationFormSubmitErrorResponse {
  error: {
    closed?: boolean;
    create_payment?: boolean;
    expired?: boolean;
    person_creation?: boolean;
  };
}

export interface UserOpenRegistration {
  exam_session_id: number;
  expires_at: string;
}

export interface UserOpenRegistrationsResponse {
  open_registrations: Array<UserOpenRegistration>;
}
