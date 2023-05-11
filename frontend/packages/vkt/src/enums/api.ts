export enum APIEndpoints {
  PublicAuthLogin = '/vkt/api/v1/auth/login/:examEventId/:type',
  PublicExamEvent = '/vkt/api/v1/examEvent',
  PublicEnrollment = '/vkt/api/v1/enrollment',
  PublicReservation = '/vkt/api/v1/reservation',
  PublicSession = '/vkt/api/v1/session',
  PublicAuth = '/vkt/api/v1/auth',
  PublicValidateTicket = '/vkt/api/v1/auth/validate',
  Payment = '/vkt/api/v1/payment',
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
  EnrollmentMovePersonAlreadyEnrolled = 'enrollmentMovePersonAlreadyEnrolled',
  ExamEventDuplicate = 'examEventDuplicate',
  InitialiseEnrollmentDuplicatePerson = 'initialiseEnrollmentDuplicatePerson',
  InitialiseEnrollmentHasCongestion = 'initialiseEnrollmentHasCongestion',
  InitialiseEnrollmentIsFull = 'initialiseEnrollmentIsFull',
  InitialiseEnrollmentRegistrationClosed = 'initialiseEnrollmentRegistrationClosed',
  InitialiseEnrollmentToQueueHasRoom = 'initialiseEnrollmentToQueueHasRoom',
  InvalidVersion = 'invalidVersion',
  InvalidTicket = 'invalidTicket',
  RenewReservationNotAllowed = 'renewReservationNotAllowed',
  ReservationPersonSessionMismatch = 'reservationPersonSessionMismatch',
  TicketValidationError = 'ticketValidationError',
}
