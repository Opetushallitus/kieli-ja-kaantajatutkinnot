import '@testing-library/cypress/add-commands';
import dayjs from 'dayjs';

import 'tests/cypress/support/commands';
import { useFixedDate } from 'tests/cypress/support/utils/date';
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
  const fixedDateForTests = dayjs('2022-06-10T16:00:00+0200');
  useFixedDate(fixedDateForTests);
});

afterEach(() => {
  worker.resetHandlers();
});
