export enum PublicRegistrationFormStep {
  Identify = 1,
  Register,
  Payment,
}

export enum PublicRegistrationInitError {
  AlreadyRegistered = 'alreadyRegistered',
  ExamSessionFull = 'examSessionFull',
  RegistrationPeriodClosed = 'registrationPeriodClosed',
}

export enum PublicRegistrationFormSubmitError {
  FormExpired = 'formExpired',
  PaymentCreationFailed = 'generic',
  PersonCreationFailed = 'generic',
  RegistrationPeriodClosed = 'registrationPeriodClosed',
}
