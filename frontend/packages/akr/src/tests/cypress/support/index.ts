import '@testing-library/cypress/add-commands';
import dayjs from 'dayjs';
import 'tests/cypress/support/commands';

// Use fixed date for all tests
beforeEach(() => {
  const fixedDateForTests = dayjs('2022-01-17T12:35:00+0200');
  cy.clock(fixedDateForTests.toDate());
});
