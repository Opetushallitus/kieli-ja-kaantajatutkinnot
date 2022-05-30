import { setupWorker } from 'msw';

import { handlers } from 'tests/msw/handlers';

export const worker = setupWorker(...handlers);
