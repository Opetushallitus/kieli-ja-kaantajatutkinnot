import { APIResponseStatus } from 'shared/enums';

export interface ClerkUser {
  oid: string;
  isAdmin: boolean;
  isExaminer: boolean;
}

export interface ClerkUserState extends ClerkUser {
  status: APIResponseStatus;
  isAuthenticated: boolean;
}
