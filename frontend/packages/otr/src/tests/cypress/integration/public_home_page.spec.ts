import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

describe('PublicHomePage', () => {
  beforeEach(() => {
    cy.openPublicHomePage();
  });

  it('should show the initial number of interpreters on the search button', () => {
    onPublicHomePage.expectFilteredInterpretersCount(
      publicInterpreters10.length,
    );
  });

  it('should allow combining different options to filter interpreters', () => {
    onPublicHomePage.expectFilteredInterpretersCount(
      publicInterpreters10.length,
    );
    onPublicHomePage.filterByToLang('ruotsi');
    onPublicHomePage.expectFilteredInterpretersCount(2);

    onPublicHomePage.filterByRegion('Uusimaa');
    onPublicHomePage.expectFilteredInterpretersCount(2);

    // No interpreter present in test fixture with a region code corresponding to Kanta-Häme.
    // The interpreter matching the following criteria instead has no regions listed;
    // this means that the interpreter is shown as available for work everywhere in Finland.
    onPublicHomePage.filterByRegion('Kanta-Häme');
    onPublicHomePage.expectFilteredInterpretersCount(1);

    // Name: Only 'Aaltonen' left at this point.
    // Make a typo with the surname, expect 0 results.
    onPublicHomePage.filterByName('Aaltonenä');
    onPublicHomePage.expectFilteredInterpretersCount(0);

    // Fix spelling => 1 hit expected.
    onPublicHomePage.filterByName('Aaltonen');
    onPublicHomePage.expectFilteredInterpretersCount(1);
  });
});
