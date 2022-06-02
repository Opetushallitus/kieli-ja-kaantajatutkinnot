import { openPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

describe('PublicHomepage', () => {
  it('It should show the initial number of interpreters on the search button', async () => {
    const expectedSearchButtonText = `Näytä tulokset (${publicInterpreters10.length})`;
    cy.openPublicHomePage();

    openPublicHomePage.expectSearchButtonText(expectedSearchButtonText);
  });
});
