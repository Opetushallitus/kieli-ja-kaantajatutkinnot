export enum APIEndpoints {
  PublicAuthLogin = '/vkt/api/v1/auth/login/:examEventId/:type?locale=:locale',
  PublicExamEvent = '/vkt/api/v1/examEvent',
  PublicEnrollment = '/vkt/api/v1/enrollment',
  PublicReservation = '/vkt/api/v1/reservation',
  PaymentCreate = '/vkt/api/v1/payment/create/:enrollmentId/redirect?locale=:locale',
  ClerkExamEvent = '/vkt/api/v1/clerk/examEvent',
  ClerkUser = '/vkt/api/v1/clerk/user',
  ClerkEnrollment = '/vkt/api/v1/clerk/enrollment',
  ClerkPayment = '/vkt/api/v1/clerk/payment',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  EnrollmentAlreadyPaid = 'enrollmentAlreadyPaid',
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
  PaymentAlreadyPaid = 'paymentAlreadyPaid',
  PaymentAmountMismatch = 'paymentAmountMismatch',
  PaymentLinkHasExpired = 'paymentLinkHasExpired',
  PaymentLinkInvalidEnrollmentStatus = 'paymentLinkInvalidEnrollmentStatus',
  PaymentPersonSessionMismatch = 'paymentPersonSessionMismatch',
  PaymentReferenceMismatch = 'paymentReferenceMismatch',
  PaymentValidationFail = 'paymentValidationFail',
  RenewReservationNotAllowed = 'renewReservationNotAllowed',
  ReservationPersonSessionMismatch = 'reservationPersonSessionMismatch',
  SessionMissingPersonId = 'sessionMissingPersonId',
  TicketValidationError = 'ticketValidationError',
}
