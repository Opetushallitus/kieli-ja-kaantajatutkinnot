import { PartialExamsAndSkills } from 'interfaces/common/enrollment';

export interface PublicEnrollmentContactDetails {
  email: string;
  emailConfirmation: string;
  phoneNumber: string;
}

export interface PublicEnrollmentAddress {
  street: string;
  postalCode: string;
  town: string;
  country: string;
}

export interface PublicEnrollment
  extends PublicEnrollmentContactDetails,
    PartialExamsAndSkills,
    PublicEnrollmentAddress {
  digitalCertificateConsent: boolean;
  privacyStatementConfirmation: boolean;
  reservationId?: number;
}
