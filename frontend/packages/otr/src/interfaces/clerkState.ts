import { APIResponseStatus } from 'shared/enums';

import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

export interface ClerkState {
  interpreters: Array<ClerkInterpreter>;
  status: APIResponseStatus;
}
