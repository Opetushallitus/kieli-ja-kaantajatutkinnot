import '@testing-library/cypress/add-commands';

import 'tests/cypress/support/commands';
import {
  fixedDateForTests,
  useFixedDate,
} from 'tests/cypress/support/utils/date';
import { worker } from 'tests/msw/browser';

// MSW configs
Cypress.on('test:before:run:async', async () => {
  await worker.start();
});

Cypress.on('test:after:run:async', async () => {
  await worker.stop();
});

beforeEach(() => {
  // Use fixed date for tests
  useFixedDate(fixedDateForTests);
});

afterEach(() => {
  worker.resetHandlers();
});
