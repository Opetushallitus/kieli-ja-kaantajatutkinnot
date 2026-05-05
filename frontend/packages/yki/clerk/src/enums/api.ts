export enum APIEndpoints {
  CountryCodes = '/yki/api/code/maatjavaltiot2',
  ClerkOrganizer = '/yki/v2/api/clerk/organizer',
  AddClerkOrganizer = '/yki/v2/api/clerk/organizer/add',
  ClerkFreeRegistration = '/yki/v2/api/clerk/registration/approvals',
  ClerkFreeRegistrationDetails = '/yki/v2/api/clerk/registration/approval/:id',
  ClerkFreeRegistrationSupplementRequest = '/yki/v2/api/clerk/registration/approval/:id/supplement-request',
  ClerkFreeRegistrationDetailsMessages = '/yki/v2/api/clerk/registration/approval/:id/comment',
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
  ClerkQuarantineMatches = '/yki/v2/api/clerk/quarantine/matches',
  ClerkQuarantineReviews = '/yki/v2/api/clerk/quarantine/reviews',
  ClerkQuarantineSetReview = '/yki/v2/api/clerk/quarantine/:id/registration/:regId/set',
  User = '/yki/api/user/identity',
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
}
