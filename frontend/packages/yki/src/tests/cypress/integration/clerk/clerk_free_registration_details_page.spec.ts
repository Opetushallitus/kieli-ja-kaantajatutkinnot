import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { onClerkFreeRegistrationDetailsPage } from 'tests/cypress/support/page-objects/clerkFreeRegistrationDetailsPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';

describe('ClerkFreeRegistrationDetailsPage', () => {
  before(() => {
    DateUtils.setDayjsLocale(AppLanguage.Finnish);
  });

  it('is visible', () => {
    cy.openClerkFreeRegistrationDetailsPage(1);
    onClerkFreeRegistrationDetailsPage.isVisible();
  });

  it('shows details correctly for PENDING free registration ', () => {
    const id = 1;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectCorrectActionButtonsVisible(id);
  });

  it('shows details correctly for APPROVED free registration ', () => {
    const id = 3;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectCorrectActionButtonsVisible(id);
  });

  it('shows details correctly for REJECTED free registration ', () => {
    const id = 4;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectCorrectActionButtonsVisible(id);
  });

  it('shows details correctly for INFORMATION_REQUESTED free registration ', () => {
    const id = 5;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectCorrectActionButtonsVisible(id);
  });

  it('shows details correctly for INFORMATION_REQUEST_ANSWERED free registration ', () => {
    const id = 6;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectCorrectActionButtonsVisible(id);
  });

  it('approves a free registration from details page', () => {
    const id = 1;
    cy.openClerkFreeRegistrationDetailsPage(id);

    // Click approve modal
    cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).click();

    // Exepect the modal to be visible
    cy.findByText('Vahvista maksuttomuuden hyväksyminen').should('be.visible');

    // Click confirm button in modal
    cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).click();

    onToast.expectText('Maksuttomuuden hyväksyminen onnistui');
  });

  it('rejects a free registration from details page', () => {
    const id = 1;
    cy.openClerkFreeRegistrationDetailsPage(id);

    // Click approve modal
    cy.findByRole('button', { name: 'Hylkää maksuttomuus' }).click();

    // Exepect the modal to be visible
    cy.findByText('Vahvista maksuttomuuden hylkääminen').should('be.visible');

    // Click confirm button in modal
    cy.findByRole('button', { name: 'Hylkää maksuttomuus' }).click();

    onToast.expectText('Maksuttomuuden hylkääminen onnistui');
  });

  it('sends information request via modal from details page', () => {
    const id = 1;
    cy.openClerkFreeRegistrationDetailsPage(id);
    cy.findByRole('button', { name: 'Lähetä lisätietopyyntö' }).click();
    onClerkFreeRegistrationDetailsPage.FillOutInformationRequest({
      message: 'Where info?',
    });
    cy.findByRole('button', { name: 'Lähetä lisätietopyyntö' }).click();
    onToast.expectText('Lisätietopyyntö lähetetty');
  });
});
