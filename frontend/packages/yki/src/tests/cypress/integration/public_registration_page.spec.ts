import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';

describe('PublicRegistrationPage', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
  });

  it('is visible', () => {
    onPublicRegistrationPage.isVisible();
  });
});
