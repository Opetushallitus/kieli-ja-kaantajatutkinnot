import { onPublicUserDetailsPage } from 'tests/cypress/support/page-objects/publicUserDetailsPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { findAlertDialogByText } from 'tests/cypress/support/utils/dialog';

const dialogHeading = 'Haluatko perua ilmoittautumisen?';

describe('PublicUserDetailsPage', () => {
  beforeEach(() => {
    cy.openPublicUserDetailsPage();
  });

  it('is visible', () => {
    onPublicUserDetailsPage.isVisible();
  });

  describe('when canceling paid exam', () => {
    it('shows dialog and user can cancel the cancellation', () => {
      onPublicUserDetailsPage.cancelPaidRegistration();
      findAlertDialogByText(dialogHeading)
        .findByRole('button', { name: 'En halua perua' })
        .click();
      cy.findByRole('alertdialog').should('not.exist');
    });

    it('shows dialog and user can cancel registrations successfully', () => {
      // Canceling the first registration
      onPublicUserDetailsPage.cancelPaidRegistration();
      findAlertDialogByText(dialogHeading).should('be.visible');
      findAlertDialogByText(dialogHeading)
        .findByRole('button', { name: 'Peru ilmoittautuminen' })
        .click();
      cy.findByRole('alertdialog').should('not.exist');
      onToast.expectText('Ilmoittautuminen peruttu onnistuneesti');

      // Canceling the second registration
      onPublicUserDetailsPage.cancelPaidRegistration();
      findAlertDialogByText(dialogHeading).should('be.visible');
      findAlertDialogByText(dialogHeading)
        .findByRole('button', { name: 'Peru ilmoittautuminen' })
        .click();
      cy.findByRole('alertdialog').should('not.exist');
      onToast.expectText('Ilmoittautuminen peruttu onnistuneesti');
    });

    it('shows error toast on failed cancellation request and do not close the modal', () => {
      // Handler returns error for 3rd registration (id 1339)
      onPublicUserDetailsPage.cancelPaidRegistration(5);
      findAlertDialogByText(dialogHeading).should('be.visible');
      findAlertDialogByText(dialogHeading)
        .findByRole('button', { name: 'Peru ilmoittautuminen' })
        .click();
      onToast.expectText('Tapahtui odottamaton virhe.');
      cy.findByRole('alertdialog').should('exist');
    });
  });
});
