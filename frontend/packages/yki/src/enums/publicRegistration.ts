export enum PublicRegistrationFormStep {
  Identify = 1,
  Register,
  Payment,
  Done,
}

export enum PublicRegistrationInitError {
  AlreadyRegistered = 'alreadyRegistered',
  ExamSessionFull = 'examSessionFull',
  Generic = 'generic',
  Past = 'past',
  Upcoming = 'upcoming',
}

export enum PublicRegistrationFormSubmitError {
  FormExpired = 'formExpired',
  PaymentCreationFailed = 'paymentCreationFailed',
  PersonCreationFailed = 'personCreationFailed',
  RegistrationPeriodClosed = 'registrationPeriodClosed',
}
