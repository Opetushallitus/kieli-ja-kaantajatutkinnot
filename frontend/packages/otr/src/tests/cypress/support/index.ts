import '@testing-library/cypress/add-commands';
import 'tests/cypress/support/commands';

import { worker } from 'tests/msw/browser';

// MSW configs
Cypress.on('test:before:run:async', async () => {
  await worker.start();
});

Cypress.on('test:after:run:async', async () => {
  await worker.stop();
});

afterEach(() => {
  worker.resetHandlers();
});
