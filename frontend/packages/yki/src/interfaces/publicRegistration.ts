import { Dayjs } from 'dayjs';

import { CertificateLanguage } from 'enums/app';

export interface PersonFillOutDetails {
  firstNames: string;
  lastName: string;
  address: string;
  postNumber: string;
  postOffice: string;
  certificateLanguage: CertificateLanguage;
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
  dateOfBirth: Dayjs;
  sex: string;
  hasSSN: boolean;
  ssn?: string;
}