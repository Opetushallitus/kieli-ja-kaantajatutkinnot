import { onClerkPersonSearchPage } from 'tests/cypress/support/page-objects/clerkPersonSearchPage';

describe('ClerkPersonSearchPage', () => {
  beforeEach(() => {
    cy.openClerkPersonSearchPage();
  });

  it('should enable search button with correct SSN', () => {
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonDisabled();
    onClerkPersonSearchPage.typeSocialSecurityNumber('090687-913J');
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonEnabled();
  });

  it('should show error with incorrect SSN', () => {
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonDisabled();
    onClerkPersonSearchPage.typeSocialSecurityNumber('090687-913Jaaa');
    onClerkPersonSearchPage.blurFieldByLabel('Syötä henkilötunnus');
    onClerkPersonSearchPage.expectSocialSecurityNumberFieldError(
      'Henkilötunnuksen muotoa ei tunnistettu'
    );
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonDisabled();
  });

  it('should show error with empty SSN', () => {
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonDisabled();
    onClerkPersonSearchPage.typeSocialSecurityNumber(
      '123 {selectall}{backspace}'
    );
    onClerkPersonSearchPage.blurFieldByLabel('Syötä henkilötunnus');
    onClerkPersonSearchPage.expectSocialSecurityNumberFieldError(
      'Tieto on pakollinen'
    );
    onClerkPersonSearchPage.expectSocialSecurityNumberSearchButtonDisabled();
  });
});
