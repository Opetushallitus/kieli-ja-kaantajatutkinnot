import { APIResponseStatus } from 'shared/enums';

export interface ClerkUser {
  oid: string;
}

export interface ClerkUserState extends ClerkUser {
  status: APIResponseStatus;
  isAuthenticated: boolean;
}
