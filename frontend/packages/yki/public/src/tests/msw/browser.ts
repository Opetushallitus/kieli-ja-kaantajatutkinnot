import { setupWorker } from 'msw/browser';

import { handlers } from 'tests/msw/handlers';
// ts-unused-exports:disable-next-line
export const worker = setupWorker(...handlers);
