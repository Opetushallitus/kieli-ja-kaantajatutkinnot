import { Dayjs } from 'dayjs';

import { CertificateLanguage, GenderEnum } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';

export interface PersonFillOutDetails {
  firstNames: string;
  lastName: string;
  address: string;
  postNumber: string;
  postOffice: string;
  certificateLanguage: CertificateLanguage | '';
}

export interface RegistrationCheckboxDetails {
  privacyStatementConfirmation: boolean;
  termsAndConditionsAgreed: boolean;
}

export interface PublicSuomiFiRegistration
  extends PersonFillOutDetails,
    RegistrationCheckboxDetails {
  email: string;
  emailConfirmation: string;
  phoneNumber: string;
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
  exam_session: ExamSession;
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
