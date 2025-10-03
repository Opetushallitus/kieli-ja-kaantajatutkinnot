import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { onClerkFreeRegistrationDetailsPage } from 'tests/cypress/support/page-objects/clerkFreeRegistrationDetailsPage';

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
    onClerkFreeRegistrationDetailsPage.expectActionButtonsVisible(id);
  });

  it('shows details correctly for APPROVED free registration ', () => {
    const id = 3;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectActionButtonsVisible(id);
  });

  it('shows details correctly for REJECTED free registration ', () => {
    const id = 4;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectActionButtonsVisible(id);
  });

  it('shows details correctly for INFORMATION_REQUESTED free registration ', () => {
    const id = 5;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectActionButtonsVisible(id);
  });

  it('shows details correctly for INFORMATION_REQUEST_ANSWERED free registration ', () => {
    const id = 6;
    cy.openClerkFreeRegistrationDetailsPage(id);
    onClerkFreeRegistrationDetailsPage.expectDetailsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectAttachmentsVisible(id);
    onClerkFreeRegistrationDetailsPage.expectActionButtonsVisible(id);
  });
});
