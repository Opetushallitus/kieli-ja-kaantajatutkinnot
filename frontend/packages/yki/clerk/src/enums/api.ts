export enum APIEndpoints {
  CountryCodes = '/yki/api/code/maatjavaltiot2',
  Organizer = '/yki/v2/api/organizer',
  OrganizerCustomersSearch = '/yki/v2/api/organizer/:oid/customer/search?page=:page&size=:size',
  OrganizerCustomersDetails = '/yki/v2/api/organizer/:oid/customer/:personOid',
  OrganizerRegistrationCancel = '/yki/v2/api/organizer/:oid/registration/:registrationId',
  OrganizerExamSession = '/yki/v2/api/organizer/:oid/examSession',
  OrganizerExamSessionExcel = '/yki/v2/api/organizer/:oid/examSession/:id/excel',
  ClerkOrganizer = '/yki/v2/api/clerk/organizer',
  AddClerkOrganizer = '/yki/v2/api/clerk/organizer/add',
  ClerkCustomerDetails = '/yki/v2/api/clerk/customer/:oid',
  ClerkExamSession = '/yki/v2/api/clerk/examSession/:id',
  ClerkExamSessions = '/yki/v2/api/clerk/examSession',
  ClerkExamSessionExcel = '/yki/v2/api/clerk/examSession/:id/excel',
  ClerkRegistrationMove = '/yki/v2/api/clerk/registration/:registrationId/move/:targetExamSessionId',
  ClerkRegistrationCancel = '/yki/v2/api/clerk/registration/:registrationId/cancel',
  ClerkCustomersSearch = '/yki/v2/api/clerk/customer/search?page=:page&size=:size',
  ClerkExamDate = '/yki/v2/api/clerk/examDate',
  ClerkPersonContactUpdate = '/yki/v2/api/clerk/person/:oid/contactDetails',
  ClerkPaymentReportExcel = '/yki/v2/api/clerk/paymentReport/excel',
  ClerkStatisticsExcel = '/yki/v2/api/clerk/statistics/excel',
  ClerkQuarantine = '/yki/v2/api/clerk/quarantine/',
  ClerkQuarantineById = '/yki/v2/api/clerk/quarantine/:id',
  ClerkQuarantineMatches = '/yki/v2/api/clerk/quarantine/matches',
  ClerkQuarantineReviews = '/yki/v2/api/clerk/quarantine/reviews',
  ClerkQuarantineSetReview = '/yki/v2/api/clerk/quarantine/:id/registration/:regId/set',
  User = '/yki/api/user/identity',
  AuthUser = '/yki/v2/auth/user',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  ExamDateCreateDuplicateDate = 'examDateCreateDuplicateDate',
  ExamDateRegistrationEndBeforeStart = 'examDateRegistrationEndBeforeStart',
  ExamDateExamBeforeRegistrationEnd = 'examDateExamBeforeRegistrationEnd',
  EvaluationExamDateHasNoLanguages = 'evaluationExamDateHasNoLanguages',
  EvaluationAlreadyExists = 'evaluationAlreadyExists',
  EvaluationInvalidDateOrder = 'evaluationInvalidDateOrder',
  ExamDateHasSessions = 'examDateHasSessions',
  ExamDateHasEvaluations = 'examDateHasEvaluations',
  QuarantineInvalidSsn = 'quarantineInvalidSsn',
  QuarantineMissingSsnAndBirthdate = 'quarantineMissingSsnAndBirthdate',
  QuarantineSsnBirthdateMismatch = 'quarantineSsnBirthdateMismatch',
  QuarantineAlreadyDeleted = 'quarantineAlreadyDeleted',
  StatisticsEmptyResult = 'statisticsEmptyResult',
}
