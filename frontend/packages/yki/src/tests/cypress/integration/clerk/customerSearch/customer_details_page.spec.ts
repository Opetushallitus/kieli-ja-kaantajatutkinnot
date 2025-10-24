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

    // headers
    onClerkCustomerDetailsPage.expectRegisteredTableHeadersVisible();
    onClerkCustomerDetailsPage.expectedQueuedTableHeadersVisible();
    onClerkCustomerDetailsPage.expectPastTableHeadersVisible();

    // Some data
    const registeredTableBody =
      onClerkCustomerDetailsPage.elements.registeredTableBody;
    registeredTableBody().should('have.length', 4);
    registeredTableBody()
      .first() // first row
      .find('td')
      .first() // first column
      .should('have.text', '1.9.2025');

    const queuedTableBody = onClerkCustomerDetailsPage.elements.queuedTableBody;
    queuedTableBody().should('have.length', 4);

    const pastTableBody = onClerkCustomerDetailsPage.elements.pastTableBody;
    pastTableBody().should('have.length', 3);
  });

  it('shows user details correctly, when user has no exams', () => {
    const id = 2;
    cy.openClerkCustomerDetailsPage(id);
    onClerkCustomerDetailsPage.isVisible(id);
    onClerkCustomerDetailsPage.expectDetailsVisible(id);

    // expect exam data is empty

    // Ilmoittautumiset
    cy.findAllByText('Ilmoittautumiset').should('be.visible');
    cy.findAllByText('Ei tulevia ilmoittautumisia').should('be.visible');

    // Jonossa
    cy.findAllByText('Jonossa').should('be.visible');
    cy.findAllByText('Ei jonotuspaikkoja').should('be.visible');

    // Menneet tutkintotilaisuudet
    cy.findAllByText('Menneet tutkintotilaisuudet').should('be.visible');
    cy.findAllByText(
      'Ei menneitä tutkintorilaisuuksia viimeisen 365 päivän ajalta',
    ).should('be.visible');
  });
});
