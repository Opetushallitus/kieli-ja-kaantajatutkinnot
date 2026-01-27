export interface AuthenticatedSession {
  'auth-method': 'CAS' | 'EMAIL' | 'SUOMIFI';
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
  | CasAuthenticatedClerkSession
  | UnauthenticatedSession;
