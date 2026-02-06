import { setupServer } from 'msw/node';

import { handlers } from 'tests/msw/handlers';

export const server = setupServer(...handlers);
