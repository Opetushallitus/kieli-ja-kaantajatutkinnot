export enum APIEndpoints {
  PublicExamEvent = '/vkt/api/v1/examEvent',
  PublicReservation = '/vkt/api/v1/examEvent/reservation',
  ClerkExamEvent = '/vkt/api/v1/clerk/examEvent',
  ClerkUser = '/vkt/api/v1/clerk/user',
  ClerkEnrollment = '/vkt/api/v1/clerk/enrollment',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  CreateReservationCongestion = 'createReservationCongestion',
  CreateReservationRegistrationClosed = 'createReservationRegistrationClosed',
  EnrollmentMoveExamEventLanguageMismatch = 'enrollmentMoveExamEventLanguageMismatch',
  ExamEventDuplicate = 'examEventDuplicate',
  InvalidVersion = 'invalidVersion',
}
