export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.vkt',
}

export enum AppRoutes {
  PublicHomePage = '/vkt/etusivu',
  ClerkHomePage = '/vkt/virkailija',
  ClerkExamCreateEventPage = '/vkt/virkailija/tutkintotilaisuus/luo',
  ClerkExamEventOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId',
  ClerkEnrollmentOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId/ilmoittautuminen',
  ClerkLocalLogoutPage = '/vkt/cas/localLogout',
  AccessibilityStatementPage = '/vkt/saavutettavuusseloste',
  PrivacyPolicyPage = '/vkt/tietosuojaseloste',
  NotFoundPage = '*',
}

export enum PublicUIViews {
  Enrollment = 'Enrollment',
  EnrollmentComplete = 'EnrollmentComplete',
  ExamEventListing = 'ExamEventListing',
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
