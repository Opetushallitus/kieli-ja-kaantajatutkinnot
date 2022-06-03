import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

beforeEach(() => {
  cy.openPublicHomePage();
});

describe('PublicHomepage', () => {
  it('should show the initial number of interpreters on the search button', () => {
    onPublicHomePage.expectFilteredInterpretersCount(
      publicInterpreters10.length
    );
  });
});
