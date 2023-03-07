export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.yki',
}

export enum AppRoutes {
  Registration = '/yki/ilmoittautuminen',
  ExamSessionRegistration = '/yki/ilmoittautuminen/tutkintotilaisuus/:examSessionId',
  Reassessment = '/yki/tarkistusarviointi',
  ReassessmentOrder = '/yki/tarkistusarviointi/:evaluationId',
  ExamSession = '/yki/tutkintotilaisuus/:examSessionId',
  NotFoundPage = '*',
  PrivacyPolicyPage = '/yki/tietosuojaseloste',
}

export enum ExternalRoutes {
  PrivacyStatementUrl = 'https://www.oph.fi/fi/koulutus-ja-tutkinnot/kieli-ja-kaantajatutkinnot/yleiset-kielitutkinnot-yki/ilmoittautuminen-yki-testiin#anchor-tietoa-henkilotietojen-kasittelysta',
  SpecialArrangements = ' https://www.oph.fi/fi/koulutus-ja-tutkinnot/kieli-ja-kaantajatutkinnot/yleiset-kielitutkinnot-yki/ilmoittautuminen-yki-testiin',
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

export enum RadioButtonValue {
  YES = 'radioButtonYes',
  NO = 'radioButtonNo',
}
