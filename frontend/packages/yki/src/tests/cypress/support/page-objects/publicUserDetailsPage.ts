import { findDialogByText } from 'tests/cypress/support/utils/dialog';

class PublicUserDetailsPage {
  elements = {
    title: () =>
      cy.findByText('Yleiset kielitutkinnot (YKI) - Omat ilmoittautumiset'),
    cancelPaidRegistration: (nth: number) =>
      cy.findAllByRole('button', { name: 'Peru ilmoittautuminen' }).eq(nth),
    cancelPaidRegistrationCancellationButton: () =>
      cy.findByRole('button', { name: 'En halua perua' }),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  cancelPaidRegistration(nth: number = 0) {
    this.elements.cancelPaidRegistration(nth).click();
  }

  cancelPaidRegistrationCancellation() {
    this.elements.cancelPaidRegistrationCancellationButton().click();
    const dialogHeading = 'Haluatko perua ilmoittautumisen?';
    findDialogByText(dialogHeading).should('be.visible');
    findDialogByText(dialogHeading)
      .findByRole('button', { name: /Peruuta/ })
      .click();
    cy.findByRole('dialog').should('not.exist');
  }
}

export const onPublicUserDetailsPage = new PublicUserDetailsPage();
