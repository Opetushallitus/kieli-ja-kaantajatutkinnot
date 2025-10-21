import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';

describe('ClerkCustomerDetailsPage', () => {
  before(() => {
    DateUtils.setDayjsLocale(AppLanguage.Finnish);
  });

  it('shows user details correctly', () => {
    const id = 1;
    cy.openClerkCustomerDetailsPage(id);
    onClerkCustomerDetailsPage.isVisible(id);
    onClerkCustomerDetailsPage.expectDetailsVisible(id);

    // expect exam data is visible
    cy.findAllByText('Ilmoittautumiset').should('be.visible');
  });

  it('shows user details correctly, when user has no exams', () => {
    const id = 2;
    cy.openClerkCustomerDetailsPage(id);
    onClerkCustomerDetailsPage.isVisible(id);
    onClerkCustomerDetailsPage.expectDetailsVisible(id);

    // expect exam data is empty
    cy.findAllByText('Ilmoittautumiset').should('be.visible');
  });
});
