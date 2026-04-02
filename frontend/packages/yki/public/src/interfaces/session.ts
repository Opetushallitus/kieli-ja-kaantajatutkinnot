export interface AuthenticatedSession {
  'auth-method': 'CAS' | 'EMAIL' | 'SUOMIFI';
  'yki-session-id'?: string;
  timeout?: number;
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
    nick_name?: string;
    oid?: string;
    zip?: string;
    street_address?: string;
    post_office?: string;
    nationalities?: Array<string>;
    'external-user-id'?: string;
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
