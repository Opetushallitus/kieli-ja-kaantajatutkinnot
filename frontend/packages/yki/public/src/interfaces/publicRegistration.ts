import { AxiosResponse } from 'axios';
import { WithId } from 'shared/interfaces';

import {
  CertificateLanguage,
  GenderEnum,
  InstructionLanguage,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';

export interface PersonFillOutDetails {
  firstNames: string;
  preferredName: string;
  lastName: string;
  address: string;
  postNumber: string;
  postOffice: string;
  phoneNumber: string;
  certificateLanguage: CertificateLanguage | '';
  instructionLanguage: InstructionLanguage | '';
  nationality: string;
  nativeLanguage: string;
  countryCode: string;
}

export interface RegistrationCheckboxDetails {
  privacyStatementConfirmation: boolean;
  termsAndConditionsAgreed: boolean;
}

export interface PublicSuomiFiRegistration
  extends PersonFillOutDetails, RegistrationCheckboxDetails, WithId {
  email: string;
  emailConfirmation: string;
}

export interface PublicEmailRegistration extends Omit<
  PublicSuomiFiRegistration,
  'emailConfirmation'
> {
  dateOfBirth?: string;
  gender?: GenderEnum;
  hasSSN?: boolean;
  ssn?: string;
}

export type PartialExamType =
  | 'ALL_PARTS'
  | 'READ'
  | 'SPEAK'
  | 'LISTEN'
  | 'WRITE';

export interface PublicRegistrationInitPayload {
  examSessionId: number;
  registrationKind: RegistrationKind;
  partialExamType: PartialExamType;
}

export interface PublicRegistrationInitRequest {
  exam_session_id: number;
  to_queue: boolean;
  partial_exam_type: PartialExamType;
}

interface OtherExamSessionRegistration {
  id: number;
  registration_id: number;
  state: RegistrationStates;
}

export interface PublicRegistrationInitErrorResponse {
  error: {
    closed?: boolean;
    full?: boolean;
    partialFull?: boolean;
    'other-exam-session-registration': OtherExamSessionRegistration;
  };
}

export interface PublicRegistrationInitErrorState {
  error: PublicRegistrationInitError;
  otherExamSessionRegistration?: OtherExamSessionRegistration;
}

export function isRegistrationInitErrorResponse(
  response: AxiosResponse,
): response is AxiosResponse<PublicRegistrationInitErrorResponse> {
  const error = response.data.error;
  if (!error) {
    return false;
  }

  return (
    'closed' in error ||
    'full' in error ||
    'partialFull' in error ||
    'exists' in error ||
    'other-exam-session-registration' in error
  );
}

export interface PublicRegistrationFormSubmitErrorResponse {
  error: {
    closed?: boolean;
    create_payment?: boolean;
    expired?: boolean;
    person_creation?: boolean;
    registered?: boolean;
  };
}

export interface UserOpenRegistration {
  exam_session_id: number;
  registration_id: number;
  expires_at: string;
}

export interface UserOpenRegistrationsResponse {
  open_registrations: Array<UserOpenRegistration>;
}
