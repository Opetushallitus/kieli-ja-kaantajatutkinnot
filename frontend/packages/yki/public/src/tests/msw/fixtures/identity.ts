import {
  EmailAuthenticatedSession,
  SuomiFiAuthenticatedSession,
} from 'interfaces/session';

// For some reason tslint reports the following as unused, even when it isn't..
// ts-unused-exports:disable-next-line
export const SuomiFiAuthenticatedSessionResponse: SuomiFiAuthenticatedSession =
  {
    identity: {
      first_name: 'Nordea',
      nick_name: 'Nordea',
      ssn: '210281-9988',
      nationalities: ['246'],
      'external-user-id': '1.2.246.562.98.28613566711',
      oid: '1.2.246.562.98.28613566711',
      zip: '20006',
      last_name: 'Demo',
      street_address: 'Mansikkatie 11',
      post_office: 'TURKU',
    },
    'auth-method': 'SUOMIFI',
    'yki-session-id': '2d85f606-b4a2-4317-a8f9-7064f4dd4a48',
    timeout: 1775129984,
  };

// ts-unused-exports:disable-next-line
export const WeaklyAuthenticatedSessionResponse: EmailAuthenticatedSession = {
  'auth-method': 'EMAIL',
  identity: {
    'external-user-id': 'foobar@test.invalid',
    email: 'foobar@test.invalid',
  },
};

// ts-unused-exports:disable-next-line
export const NoSessionResponse = { identity: null };
