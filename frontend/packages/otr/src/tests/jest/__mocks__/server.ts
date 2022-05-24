import { setupServer } from 'msw/node';

import { handlers } from 'tests/jest/__mocks__/handlers';

export const server = setupServer(...handlers);
