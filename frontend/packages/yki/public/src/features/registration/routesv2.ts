import { generatePath } from 'react-router';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  RegistrationContext,
  RegistrationKey,
  RegistrationStep,
} from 'features/registration/modelv2';

export const RegistrationRoutes = {
  Listing: '/yki/ilmoittautuminen/v2',
  Identify:
    '/yki/ilmoittautuminen/tunnistaudu/tutkintotilaisuus/:examSessionId/:registrationId',
  Register:
    '/yki/ilmoittautuminen/ilmoittaudu/tutkintotilaisuus/:examSessionId/:registrationId',
  Payment:
    '/yki/ilmoittautuminen/maksa/tutkintotilaisuus/:examSessionId/:registrationId',
  Done: '/yki/ilmoittautuminen/valmis/tutkintotilaisuus/:examSessionId/:registrationId',
} as const;
export const stepPath = (step: RegistrationStep, key: RegistrationKey) =>
  generatePath(RegistrationRoutes[step], {
    examSessionId: String(key.examSessionId),
    registrationId: String(key.registrationId),
  });
export const responseStep = (
  data: RegistrationContext,
  requested: RegistrationStep,
): RegistrationStep => {
  if (
    data.state === RegistrationStates.Completed ||
    (data.state === RegistrationStates.Submitted &&
      data.registration_kind === RegistrationKind.Queue)
  )
    return 'Done';
  if (data.state === RegistrationStates.Submitted) return 'Payment';
  if (!data.session.identity || requested === 'Identify') return 'Identify';

  return 'Register';
};
