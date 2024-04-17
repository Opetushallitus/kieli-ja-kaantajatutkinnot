export enum PublicRegistrationFormStep {
  Identify = 1,
  Register,
  Payment,
  Done,
}

export enum PublicRegistrationInitError {
  AlreadyRegistered = 'alreadyRegistered',
  ExamSessionFull = 'full',
  Generic = 'generic',
  Past = 'past',
  Unauthorized = 'unauthorized',
  Upcoming = 'upcoming',
}

export enum PublicRegistrationFormSubmitError {
  FormExpired = 'formExpired',
  PaymentCreationFailed = 'paymentCreationFailed',
  PersonCreationFailed = 'personCreationFailed',
  RegistrationPeriodClosed = 'registrationPeriodClosed',
}
