export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.vkt',
}

const excellentLevelRoutePrefix = '/vkt/erinomainen-taito';
const excellentLevelEnrollmentRoute =
  excellentLevelRoutePrefix + '/ilmoittaudu';

export enum AppRoutes {
  PublicRoot = '/vkt',
  PublicHomePage = '/vkt/etusivu',

  // Routes for excellent level
  PublicExcellentLevelLanding = excellentLevelRoutePrefix,
  PublicEnrollment = excellentLevelEnrollmentRoute,
  PublicAuth = excellentLevelEnrollmentRoute + '/:examEventId/tunnistaudu',
  PublicEnrollmentContactDetails = excellentLevelEnrollmentRoute +
    '/:examEventId/tiedot',
  PublicEnrollmentEducationDetails = excellentLevelEnrollmentRoute +
    '/:examEventId/koulutus',
  PublicEnrollmentSelectExam = excellentLevelEnrollmentRoute +
    '/:examEventId/tutkinto',
  PublicEnrollmentPreview = excellentLevelEnrollmentRoute +
    '/:examEventId/esikatsele',
  PublicEnrollmentPaymentFail = excellentLevelEnrollmentRoute +
    '/:examEventId/maksu/peruutettu',
  PublicEnrollmentPaymentSuccess = excellentLevelEnrollmentRoute +
    '/:examEventId/maksu/valmis',
  PublicEnrollmentDoneQueued = excellentLevelEnrollmentRoute +
    '/:examEventId/jono-valmis',
  PublicEnrollmentDone = excellentLevelEnrollmentRoute + '/:examEventId/valmis',

  // Routes for good and satisfactory level - TODO
  PublicGoodAndSatisfactoryLevelLanding = '/vkt/hyva-ja-tyydyttava-taito',
  PublicEnrollmentAppointment = '/vkt/markkinapaikka',
  PublicAuthAppointment = '/vkt/markkinapaikka/:enrollmentId/tunnistaudu',
  PublicEnrollmentAppointmentContactDetails = '/vkt/markkinapaikka/:enrollmentId/tiedot',
  PublicEnrollmentAppointmentPreview = '/vkt/markkinapaikka/:enrollmentId/esikatsele',
  PublicEnrollmentAppointmentPaymentFail = '/vkt/markkinapaikka/:enrollmentId/maksu/peruutettu',
  PublicEnrollmentAppointmentPaymentSuccess = '/vkt/markkinapaikka/:enrollmentId/maksu/valmis',

  PublicEnrollmentContact = '/vkt/markkinapaikka/ota-yhteytta',
  PublicEnrollmentContactContactDetails = '/vkt/markkinapaikka/ota-yhteytta/:appointeeId/tiedot',
  PublicEnrollmentContactSelectExam = '/vkt/markkinapaikka/ota-yhteytta/:appointeeId/tutkinto',
  PublicEnrollmentContactDone = '/vkt/markkinapaikka/ota-yhteytta/:appointeeId/valmis',

  // Routes for clerk user
  ClerkHomePage = '/vkt/virkailija',
  ClerkExamEventCreatePage = '/vkt/virkailija/tutkintotilaisuus/luo',
  ClerkExamEventOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId',
  ClerkEnrollmentOverviewPage = '/vkt/virkailija/tutkintotilaisuus/:examEventId/ilmoittautuminen',
  ClerkLocalLogoutPage = '/vkt/cas/localLogout',

  // Miscellaneous
  AccessibilityStatementPage = '/vkt/saavutettavuusseloste',
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
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
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

export enum PublicNavigationLink {
  FrontPage = 'frontPage',
  ExcellentLevel = 'excellentLevel',
  GoodAndSatisfactoryLevel = 'goodAndSatisfactoryLevel',
}
