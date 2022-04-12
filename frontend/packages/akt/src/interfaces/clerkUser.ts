import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';

export interface ClerkUser {
  oid: string;
}

export interface ClerkUserAction extends Action {
  clerkUser: ClerkUser;
}

export interface ClerkUserState extends ClerkUser {
  status: APIResponseStatus;
  isAuthenticated: boolean;
}
