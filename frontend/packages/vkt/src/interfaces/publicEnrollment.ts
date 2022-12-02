export interface PublicEnrollmentContactDetails {
  email: string;
  emailConfirmation: string;
  phoneNumber: string;
}

export interface PublicEnrollmentPartialExamSelection {
  oralSkill: boolean;
  textualSkill: boolean;
  understandingSkill: boolean;
  speakingPartialExam: boolean;
  speechComprehensionPartialExam: boolean;
  writingPartialExam: boolean;
  readingComprehensionPartialExam: boolean;
}

export interface PublicEnrollmentAddress {
  street: string;
  postalCode: string;
  town: string;
  country: string;
}

export interface PublicEnrollment
  extends PublicEnrollmentContactDetails,
    PublicEnrollmentPartialExamSelection,
    PublicEnrollmentAddress {
  digitalCertificateConsent: boolean;
  privacyStatementConfirmation: boolean;
}
