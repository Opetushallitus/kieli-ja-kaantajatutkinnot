export enum RegistrationRoutes {
  Registration = '/yki/ilmoittautuminen/vw',
  ExamSession = '/yki/ilmoittautuminen/vw/tutkintotilaisuus/:examSessionId',
  ExamSessionRegistration = '/yki/ilmoittautuminen/vw/tutkintotilaisuus/:examSessionId/:registrationId',
  ExamSessionQueue = '/yki/ilmoittautuminen/vw/tutkintotilaisuus/:examSessionId/:registrationId/jono',
  RegistrationPaymentStatus = '/yki/ilmoittautuminen/vw/maksu/tila',
  FreeRegistrationSuccess = '/yki/ilmoittautuminen/vw/maksuton/:examSessionId/:registrationId/valmis',
}
