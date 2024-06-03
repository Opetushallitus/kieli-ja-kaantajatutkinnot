export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.vkt',
}

export enum AppRoutes {
  PublicRoot = '/vkt',
  PublicHomePage = '/vkt/etusivu',
  PublicEnrollment = '/vkt/ilmoittaudu',
  PublicAuth = '/vkt/ilmoittaudu/:examEventId/tunnistaudu',
  PublicEnrollmentContactDetails = '/vkt/ilmoittaudu/:examEventId/tiedot',
  PublicEnrollmentSelectExam = '/vkt/ilmoittaudu/:examEventId/tutkinto',
  PublicEnrollmentPreview = '/vkt/ilmoittaudu/:examEventId/esikatsele',
  PublicEnrollmentPaymentFail = '/vkt/ilmoittaudu/:examEventId/maksu/peruutettu',
  PublicEnrollmentPaymentSuccess = '/vkt/ilmoittaudu/:examEventId/maksu/valmis',
  PublicEnrollmentDone = '/vkt/ilmoittaudu/:examEventId/valmis',
  ClerkHomePage = '/vkt/virkailija',
  ClerkExamEventCreatePage = '/vkt/virkailija/tutkintotilaisuus/luo',
  ClerkExamEventOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId',
  ClerkEnrollmentOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId/ilmoittautuminen',
  ClerkLocalLogoutPage = '/vkt/cas/localLogout',
  AccessibilityStatementPage = '/vkt/saavutettavuusseloste',
  PrivacyPolicyPage = '/vkt/tietosuojaseloste',
  LogoutSuccess = '/vkt/uloskirjautuminen-onnistui',
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
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  SHIFTED_FROM_QUEUE = 'SHIFTED_FROM_QUEUE',
  EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT = 'EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT',
  QUEUED = 'QUEUED',
  CANCELED = 'CANCELED',
  CANCELED_UNFINISHED_ENROLLMENT = 'CANCELED_UNFINISHED_ENROLLMENT',
}

export enum PaymentStatus {
  NEW = 'NEW',
  OK = 'OK',
  FAIL = 'FAIL',
  PENDING = 'PENDING',
  DELAYED = 'DELAYED',
}
