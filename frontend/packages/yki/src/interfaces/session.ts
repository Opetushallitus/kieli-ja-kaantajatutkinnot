export interface AuthenticatedSession {
  'auth-method': 'CAS' | 'EMAIL' | 'SUOMIFI';
}

export interface EmailAuthenticatedSession extends AuthenticatedSession {
  'auth-method': 'EMAIL';
  identity: {
    'external-user-id': string;
    email: string;
  };
}

export interface SuomiFiAuthenticatedSession extends AuthenticatedSession {
  'auth-method': 'SUOMIFI';
  identity: {
    first_name: string;
    last_name: string;
    ssn: string;
  };
}

export interface CasAuthenticatedClerkSession extends AuthenticatedSession {
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
