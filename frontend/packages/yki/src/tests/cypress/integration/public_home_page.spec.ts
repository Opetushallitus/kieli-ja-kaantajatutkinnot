import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';

describe('PublicHomePage', () => {
  beforeEach(() => {
    cy.openPublicHomePage();
  });

  it('is visible', () => {
    onPublicHomePage.isVisible();
  });
});
