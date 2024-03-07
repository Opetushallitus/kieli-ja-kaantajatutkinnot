import { SuomiFiAuthenticatedSession } from 'interfaces/session';

// For some reason tslint reports the following as unused, even when it isn't..
// ts-unused-exports:disable-next-line
export const SuomiFiAuthenticatedSessionResponse: SuomiFiAuthenticatedSession =
  {
    'auth-method': 'SUOMIFI',
    identity: {
      first_name: 'Teuvo',
      last_name: 'Testitapaus',
      ssn: '030594W903B',
    },
  };

export const NoSessionResponse = { identity: null };
