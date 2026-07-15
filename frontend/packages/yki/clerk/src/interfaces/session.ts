interface AuthenticatedSession {
  'auth-method': 'CAS';
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

export interface User {
  oid: string;
  isAdmin: boolean;
  isOrganizer: boolean;
}

export interface Me {
  lang: string;
}
