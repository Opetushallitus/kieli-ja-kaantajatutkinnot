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

  it('should allow combining different options to filter interpreters', () => {
    onPublicHomePage.expectFilteredInterpretersCount(
      publicInterpreters10.length
    );
    // FI-SV => 2 interpreters
    onPublicHomePage.filterByToLang('ruotsi');
    onPublicHomePage.expectFilteredInterpretersCount(2);

    // Region: Uusimaa => 2 interpreters
    onPublicHomePage.filterByRegion('Uusimaa');
    onPublicHomePage.expectFilteredInterpretersCount(2);

    // Region: Kanta-Häme => 1 interpreter (with no regions defined, ie. operating in the whole country)
    onPublicHomePage.filterByRegion('Kanta-Häme');
    onPublicHomePage.expectFilteredInterpretersCount(1);
  });
});
