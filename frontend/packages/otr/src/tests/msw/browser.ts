import { setupWorker } from 'msw';

import { handlers } from 'tests/msw/handlers';
// ts-unused-exports:disable-next-line
export const worker = setupWorker(...handlers);
