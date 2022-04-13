import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';

describe('Accessibility', () => {
  it('should show skip to main content link when it receives keyboard focus', () => {
    cy.openPublicHomePage();

    onPublicHomePage.focusSkipLink();

    onPublicHomePage.expectText('Jatka sisältöön');
  });
});
