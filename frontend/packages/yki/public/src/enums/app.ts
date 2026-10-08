export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.yki',
}

export enum AppRoutes {
  PublicRoot = '/yki',
  AccessibilityStatementPage = '/yki/saavutettavuus',
  Registration = '/yki/ilmoittautuminen',
  RegistrationPaymentStatus = '/yki/ilmoittautuminen/maksu/tila',
  FreeRegistrationSuccess = '/yki/ilmoittautuminen/maksuton/:examSessionId/:registrationId/valmis',
  ExamSessionRegistration = '/yki/ilmoittautuminen/tutkintotilaisuus/:examSessionId/:registrationId',
  ExamSessionQueue = '/yki/ilmoittautuminen/tutkintotilaisuus/:examSessionId/:registrationId/jono',
  Reassessment = '/yki/tarkistusarviointi',
  ReassessmentOrder = '/yki/tarkistusarviointi/:evaluationId',
  ReassessmentOrderStatus = '/yki/tarkistusarviointi/maksu/tila',
  ExamSession = '/yki/tutkintotilaisuus/:examSessionId',
  LogoutSuccess = '/yki/uloskirjautuminen-onnistui',
  UserDetails = '/yki/kayttaja/tiedot',
  ModifyContactDetails = '/yki/kayttaja/tiedot/muokkaa',
  ConfirmRegistration = '/yki/kayttaja/vahvista/:registrationId',
  ExpiredLoginLinkPage = '/yki/linkki-vanhentunut/:code',
  NotFoundPage = '*',
}

export enum HeaderTabNav {
  Registration = 'registration',
  Reassessment = 'reassessment',
  UserRegistrations = 'userRegistrations',
}

export enum ExamLanguage {
  ALL = 'all',
  DEU = 'deu',
  ENG = 'eng',
  FIN = 'fin',
  FRA = 'fra',
  ITA = 'ita',
  RUS = 'rus',
  SME = 'sme',
  SPA = 'spa',
  SWE = 'swe',
}

export enum ExamLevel {
  ALL = 'ALL',
  PERUS = 'PERUS',
  KESKI = 'KESKI',
  YLIN = 'YLIN',
}

export enum CertificateLanguage {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export enum InstructionLanguage {
  FI = 'fi',
  SV = 'sv',
}

export enum RadioButtonValue {
  YES = 'radioButtonYes',
  NO = 'radioButtonNo',
}

export enum GenderEnum {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToDisclose = 'preferNotToDisclose',
}

export enum RegistrationKind {
  Admission = 'ADMISSION',
  Queue = 'QUEUE',
}

export enum YkiValidationErrors {
  MismatchingEmails = 'errors.mismatchingEmails',
  PreferredNameMustBeFirstName = 'errors.preferredNameMustBeFirstName',
}

export enum RegistrationStates {
  Completed = 'COMPLETED',
  Submitted = 'SUBMITTED',
  Started = 'STARTED',
  Expired = 'EXPIRED',
  Cancelled = 'CANCELLED',
  PaidAndCancelled = 'PAID_AND_CANCELLED',
  Unknown = 'UNKNOWN',
}

export enum EvaluationState {
  EvaluationPending = 'EVALUATION_PENDING',
  EvaluationComplete = 'EVALUATION_COMPLETE',
  ReviewPending = 'REVIEW_PENDING',
  ReviewComplete = 'REVIEW_COMPLETE',
  ReviewFinalized = 'REVIEW_FINALIZED',
  RetakePending = 'RETAKE_PENDING',
  NoShow = 'NO_SHOW',
  Aborted = 'ABORTED',
}
