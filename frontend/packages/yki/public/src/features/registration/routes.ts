export enum RegistrationRoutes {
  Registration = '/yki/ilmoittautuminen/v2',
  ExamSession = '/yki/ilmoittautuminen/v2/tutkintotilaisuus/:examSessionId',
  ExamSessionRegistration = '/yki/ilmoittautuminen/v2/tutkintotilaisuus/:examSessionId/:registrationId',
  ExamSessionQueue = '/yki/ilmoittautuminen/v2/tutkintotilaisuus/:examSessionId/:registrationId/jono',
  RegistrationPaymentStatus = '/yki/ilmoittautuminen/v2/maksu/tila',
  FreeRegistrationSuccess = '/yki/ilmoittautuminen/v2/maksuton/:examSessionId/:registrationId/valmis',
}
