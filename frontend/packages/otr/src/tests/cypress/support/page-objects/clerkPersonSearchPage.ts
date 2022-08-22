import { Matcher } from '@testing-library/dom';

class ClerkPersonSearchPage {
  elements = {
    socialSecurityNumberField: () =>
      cy.findByTestId('clerk-person-search-page__ssn__field'),
    socialSecurityNumberSearchButton: () =>
      cy.findByTestId('clerk-person-search-page__ssn__search-button'),
    byLabel: (label: Matcher) =>
      cy
        .findByTestId('clerk-person-search-page__ssn__field')
        .findByLabelText(label),
  };

  typeSocialSecurityNumber(socialSecurityNumber: string) {
    this.elements
      .socialSecurityNumberField()
      .should('be.visible')
      .type(socialSecurityNumber);
  }

  clickSearchButton() {
    this.elements
      .socialSecurityNumberSearchButton()
      .should('be.visible')
      .click();
  }

  expectSocialSecurityNumberFieldError(fieldError: string) {
    const regexp = new RegExp(fieldError, 'i');

    this.elements
      .socialSecurityNumberField()
      .findByText(regexp)
      .should('exist');
  }

  blurFieldByLabel(label: Matcher) {
    this.elements.byLabel(label).focus().blur();
  }

  expectSocialSecurityNumberSearchButtonEnabled() {
    this.elements.socialSecurityNumberSearchButton().should('be.enabled');
  }

  expectSocialSecurityNumberSearchButtonDisabled() {
    this.elements.socialSecurityNumberSearchButton().should('be.disabled');
  }
}

export const onClerkPersonSearchPage = new ClerkPersonSearchPage();
