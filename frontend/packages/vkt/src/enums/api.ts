export enum APIEndpoints {
  PublicExamEvent = '/vkt/api/v1/examEvent',
  ClerkExamEvent = '/vkt/api/v1/clerk/examEvent',
  ClerkUser = '/vkt/api/v1/clerk/user',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  CreateReservationCongestion = 'createReservationCongestion',
  CreateReservationRegistrationClosed = 'createReservationRegistrationClosed',
  ExamEventDuplicate = 'examEventDuplicate',
  InvalidVersion = 'invalidVersion',
}
