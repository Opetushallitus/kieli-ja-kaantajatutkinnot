export interface PartialExams {
  understandingSkill: boolean;
  speakingPartialExam: boolean;
  speechComprehensionPartialExam: boolean;
  writingPartialExam: boolean;
  readingComprehensionPartialExam: boolean;
}

export interface PartialExamsAndSkills extends PartialExams {
  oralSkill: boolean;
  textualSkill: boolean;
}

export interface CertificateShippingTextFields {
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
}

export interface CertificateShippingData extends CertificateShippingTextFields {
  digitalCertificateConsent: boolean;
}
