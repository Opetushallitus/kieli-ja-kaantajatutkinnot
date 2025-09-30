import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';

describe('ClerkFreeRegistrationPage', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
  });

  it('is visible', () => {
    onPublicRegistrationPage.isVisible();
  });
});
