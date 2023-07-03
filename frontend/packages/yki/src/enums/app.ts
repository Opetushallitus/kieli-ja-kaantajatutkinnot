export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.yki',
}

export enum AppRoutes {
  Registration = '/yki/ilmoittautuminen',
  RegistrationPaymentStatus = '/yki/ilmoittautuminen/maksu/tila',
  ExamSessionRegistration = '/yki/ilmoittautuminen/tutkintotilaisuus/:examSessionId',
  Reassessment = '/yki/tarkistusarviointi',
  ReassessmentOrder = '/yki/tarkistusarviointi/:evaluationId',
  ReassessmentOrderStatus = '/yki/tarkistusarviointi/maksu/tila',
  ExamSession = '/yki/tutkintotilaisuus/:examSessionId',
  NotFoundPage = '*',
}

export enum HeaderTabNav {
  Registration = 'registration',
  Reassessment = 'reassessment',
}

export enum ExamLanguage {
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
  YLIN = 'YLIN',
  KESKI = 'KESKI',
  PERUS = 'PERUS',
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
}
