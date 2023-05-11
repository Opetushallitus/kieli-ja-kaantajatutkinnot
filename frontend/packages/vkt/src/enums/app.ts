export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.vkt',
}

export enum AppRoutes {
  PublicHomePage = '/vkt/etusivu',
  PublicEnrollment = '/vkt/ilmoittaudu',
  PublicAuth = '/vkt/ilmoittaudu/:examEventId/tunnistaudu',
  PublicEnrollmentContactDetails = '/vkt/ilmoittaudu/:examEventId/:reservationId/tiedot',
  PublicEnrollmentSelectExam = '/vkt/ilmoittaudu/:examEventId/:reservationId/tutkinto',
  PublicEnrollmentPreview = '/vkt/ilmoittaudu/:examEventId/:reservationId/esikatsele',
  PublicEnrollmentDone = '/vkt/ilmoittaudu/:examEventId/:reservationId/valmis',
  PublicEnrollmentSuccess = '/vkt/ilmoittaudu/maksu/valmis',
  PublicEnrollmentFail = '/vkt/ilmoittaudu/maksu/peruutettu',
  ClerkHomePage = '/vkt/virkailija',
  ClerkExamEventCreatePage = '/vkt/virkailija/tutkintotilaisuus/luo',
  ClerkExamEventOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId',
  ClerkEnrollmentOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId/ilmoittautuminen',
  ClerkLocalLogoutPage = '/vkt/cas/localLogout',
  AccessibilityStatementPage = '/vkt/saavutettavuusseloste',
  PrivacyPolicyPage = '/vkt/tietosuojaseloste',
  NotFoundPage = '*',
}

export enum ExamLanguage {
  ALL = 'ALL',
  FI = 'FI',
  SV = 'SV',
}

export enum ExamLevel {
  EXCELLENT = 'EXCELLENT',
}

export enum ExamEventToggleFilter {
  Upcoming = 'upcoming',
  Passed = 'passed',
}

export enum HeaderNavTab {
  ExamEvents = 'examEvents',
}

export enum UIMode {
  Edit = 'edit',
  View = 'view',
}

export enum EnrollmentStatus {
  PAID = 'PAID',
  EXPECTING_PAYMENT = 'EXPECTING_PAYMENT',
  QUEUED = 'QUEUED',
  CANCELED = 'CANCELED',
}
