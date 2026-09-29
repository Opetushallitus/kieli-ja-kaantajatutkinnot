import { SetupWorker } from 'msw/browser';

// Support and spec files have separate webpack module caches. Pass the running
// worker explicitly instead of creating a second worker for spec overrides.
const shared = globalThis as typeof globalThis & {
  ykiTestWorker?: SetupWorker;
};
export const setTestWorker = (worker: SetupWorker) => {
  shared.ykiTestWorker = worker;
};
export const getTestWorker = () => {
  if (!shared.ykiTestWorker)
    throw new Error('Cypress support must register its MSW worker first');

  return shared.ykiTestWorker;
};
