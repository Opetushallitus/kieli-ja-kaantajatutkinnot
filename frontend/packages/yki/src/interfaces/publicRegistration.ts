import { Dayjs } from 'dayjs';
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
  nationality: string;
  dateOfBirth: Dayjs | '';
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
  };
  is_strongly_identified: boolean;
}

export interface PublicRegistrationError {
  error: {
    closed?: boolean;
    create_payment?: boolean;
    expired?: boolean;
    full?: boolean;
    person_creation?: boolean;
    registered?: boolean;
  };
}
