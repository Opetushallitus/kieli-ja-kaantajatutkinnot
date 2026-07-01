export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.vkt',
}

const excellentLevelRoutePrefix = '/vkt/erinomainen-taito';
const excellentLevelEnrollmentRoute =
  excellentLevelRoutePrefix + '/ilmoittaudu';

const goodAndSatisfactoryLevelRoutePrefix = '/vkt/hyva-ja-tyydyttava-taito';
const goodAndSatisfactoryLevelEnrollmentRoute =
  goodAndSatisfactoryLevelRoutePrefix + '/ilmoittaudu';
const goodAndSatisfactoryLevelContactRoute =
  goodAndSatisfactoryLevelRoutePrefix + '/ota-yhteytta';
const clerkExcellentLevelRoutePrefix = '/vkt/virkailija/erinomainen-taito';

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

  // Routes for good and satisfactory level
  PublicGoodAndSatisfactoryLevelLanding = goodAndSatisfactoryLevelRoutePrefix,
  PublicEnrollmentAppointment = goodAndSatisfactoryLevelEnrollmentRoute,
  PublicAuthAppointment = goodAndSatisfactoryLevelEnrollmentRoute +
    '/:enrollmentId/tunnistaudu',
  PublicEnrollmentAppointmentContactDetails = goodAndSatisfactoryLevelEnrollmentRoute +
    '/:enrollmentId/tiedot',
  PublicEnrollmentAppointmentPreview = goodAndSatisfactoryLevelEnrollmentRoute +
    '/:enrollmentId/esikatsele',
  PublicEnrollmentAppointmentPaymentFail = goodAndSatisfactoryLevelEnrollmentRoute +
    '/:enrollmentId/maksu/peruutettu',
  PublicEnrollmentAppointmentPaymentSuccess = goodAndSatisfactoryLevelEnrollmentRoute +
    '/:enrollmentId/maksu/valmis',
  PublicEnrollmentAppointmentPaymentNonAuthSuccess = goodAndSatisfactoryLevelEnrollmentRoute +
    '/maksu/valmis',

  PublicEnrollmentContact = goodAndSatisfactoryLevelContactRoute,
  PublicEnrollmentContactContactDetails = goodAndSatisfactoryLevelContactRoute +
    '/:examinerId/tiedot',
  PublicEnrollmentContactSelectExam = goodAndSatisfactoryLevelContactRoute +
    '/:examinerId/tutkinto',
  PublicEnrollmentContactDone = goodAndSatisfactoryLevelContactRoute +
    '/:examinerId/valmis',

  ClerkLocalLogoutPage = '/vkt/cas/localLogout',
  ClerkRoot = '/vkt/virkailija',
  ClerkPaymentReportPage = '/vkt/virkailija/maksuraportti',

  // Routes for clerk user / excellent level
  ClerkExcellentLevelPage = clerkExcellentLevelRoutePrefix,
  ClerkExamEventCreatePage = clerkExcellentLevelRoutePrefix +
    '/tutkintotilaisuus/luo',
  ClerkExamEventOverviewPage = clerkExcellentLevelRoutePrefix +
    '/tutkintotilaisuus/:examEventId',
  ClerkEnrollmentOverviewPage = clerkExcellentLevelRoutePrefix +
    '/tutkintotilaisuus/:examEventId/ilmoittautuminen',
  // Routes for clerk user / good and satisfactory level
  ClerkGoodAndSatisfactoryLevelPage = '/vkt/virkailija/hyva-ja-tyydyttava-taito',
  // Routes for examiner
  ExaminerRoot = '/vkt/tv',
  ExaminerHomePage = '/vkt/tv/:oid',
  ExaminerDetailsPage = '/vkt/tv/:oid/omat-tiedot',
  ExaminerExamEventCreatePage = '/vkt/tv/:oid/tutkintotilaisuus/luo',
  ExaminerExamEventPage = '/vkt/tv/:oid/tutkintotilaisuus/:examEventId',
  ExaminerExamEventUpdatePage = '/vkt/tv/:oid/tutkintotilaisuus/:examEventId/muokkaa',
  ExaminerEnrollmentContactRequestPage = '/vkt/tv/:oid/yhteydenottopyynto/:enrollmentContactRequestId',
  ExaminerEnrollmentAppointmentPage = '/vkt/tv/:oid/ilmoittautuminen/:enrollmentAppointmentId',
  ExaminerEnrollmentAppointmentPageEdit = '/vkt/tv/:oid/ilmoittautuminen/:enrollmentAppointmentId/muokkaa',

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
  GOOD_AND_SATISFACTORY = 'GOOD_AND_SATISFACTORY',
}

export enum ExamEventToggleFilter {
  Upcoming = 'upcoming',
  Passed = 'passed',
}

export enum ExamGrades {
  GOOD = 'GOOD',
  SATISFACTORY = 'SATISFACTORY',
  FAILED = 'FAILED',
  NOT_COMPLETED = 'NOT_COMPLETED',
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

export enum EnrollmentAppointmentStatus {
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  EXPECTING_PAYMENT = 'EXPECTING_PAYMENT',
  WAITING_AUTHENTICATION = 'WAITING_AUTHENTICATION',
  CANCELED_PAYMENT = 'CANCELED_PAYMENT',
  ENROLLMENT_CREATED = 'ENROLLMENT_CREATED',
  CONTACT_CREATED = 'CONTACT_CREATED',
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
