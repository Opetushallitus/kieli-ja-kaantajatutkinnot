import '@testing-library/cypress/add-commands';
import dayjs from 'dayjs';

import 'tests/cypress/support/commands';
import { setTestWorker } from 'tests/cypress/support/mswv2';
import { useFixedDate } from 'tests/cypress/support/utils/date';
import { worker } from 'tests/msw/browser';
import { resetData } from 'tests/msw/handlers';
import { enableMockPaymentNavigation } from 'tests/msw/paymentNavigation';

setTestWorker(worker);

// The Cypress worker lives outside the app window; install the same mock-only
// payment navigation used by the local MSW entrypoint in each app document.
Cypress.on('window:before:load', (win) => enableMockPaymentNavigation(win));

// Override the worker started by this support bundle, rather than creating a
// second worker instance in a spec bundle.
Cypress.Commands.add('useMswHandlers', (...handlers) => {
  worker.use(...handlers);
});

// MSW configs
Cypress.on('test:before:run:async', async () => {
  await worker.start();
});

Cypress.on('test:after:run:async', async () => {
  await worker.stop();
});

beforeEach(() => {
  // Use fixed date for tests
  const fixedDateForTests = dayjs('2022-09-27T16:00:00+0200');
  useFixedDate(fixedDateForTests);
});

afterEach(() => {
  worker.resetHandlers();
  resetData();
});
