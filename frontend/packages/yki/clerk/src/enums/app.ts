export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.yki',
}

export enum AppRoutes {
  NotFoundPage = '*',
  ClerkRoot = '/yki/v2/virkailija',
  CustomerSearch = '/yki/v2/virkailija/asiakashaku',
  ClerkCustomerDetails = '/yki/v2/virkailija/asiakashaku/:oid',
  ClerkOrganizerRegister = '/yki/v2/virkailija/jarjestajarekisteri',
  ClerkOrganizerRegisterDetails = '/yki/v2/virkailija/jarjestajarekisteri/:oid/tutkintotilaisuudet',
  ClerkFreeRegistration = '/yki/v2/virkailija/maksuttomuus',
  ClerkFreeRegistrationDetails = '/yki/v2/virkailija/maksuttomuus/:id',
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

export enum RegistrationStates {
  Completed = 'COMPLETED',
  Submitted = 'SUBMITTED',
  Started = 'STARTED',
  Expired = 'EXPIRED',
  Cancelled = 'CANCELLED',
  PaidAndCancelled = 'PAID_AND_CANCELLED',
  Unknown = 'UNKNOWN',
}
