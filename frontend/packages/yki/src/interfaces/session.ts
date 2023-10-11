export interface EmailAuthenticatedSession {
  'auth-method': 'EMAIL';
  identity: {
    'external-user-id': string;
  };
}

export interface SuomiFiAuthenticatedSession {
  'auth-method': 'SUOMIFI';
  identity: {
    first_name: string;
    last_name: string;
    ssn: string;
  };
}

export interface CasAuthenticatedClerkSession {
  'auth-method': 'CAS';
  identity: {
    username: string;
  };
}

interface UnauthenticatedSession {
  identity: null;
}

export type SessionResponse =
  | EmailAuthenticatedSession
  | SuomiFiAuthenticatedSession
  | CasAuthenticatedClerkSession
  | UnauthenticatedSession;
