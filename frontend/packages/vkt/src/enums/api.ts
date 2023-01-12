export enum APIEndpoints {
  PublicExamEvent = '/vkt/api/v1/examEvent',
  PublicEnrollment = '/vkt/api/v1/enrollment',
  PublicReservation = '/vkt/api/v1/reservation',
  ClerkExamEvent = '/vkt/api/v1/clerk/examEvent',
  ClerkUser = '/vkt/api/v1/clerk/user',
  ClerkEnrollment = '/vkt/api/v1/clerk/enrollment',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  EnrollmentMoveExamEventLanguageMismatch = 'enrollmentMoveExamEventLanguageMismatch',
  ExamEventDuplicate = 'examEventDuplicate',
  InitialiseEnrollmentHasCongestion = 'initialiseEnrollmentHasCongestion',
  InitialiseEnrollmentIsFull = 'initialiseEnrollmentIsFull',
  InitialiseEnrollmentRegistrationClosed = 'initialiseEnrollmentRegistrationClosed',
  InitialiseEnrollmentToQueueHasRoom = 'initialiseEnrollmentToQueueHasRoom',
  InvalidVersion = 'invalidVersion',
}
