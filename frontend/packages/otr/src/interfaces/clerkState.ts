import { Action } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

export interface ClerkState {
  interpreters: Array<ClerkInterpreter>;
  status: APIResponseStatus;
}

export interface ClerkAction extends Action<string>, Partial<ClerkState> {}
