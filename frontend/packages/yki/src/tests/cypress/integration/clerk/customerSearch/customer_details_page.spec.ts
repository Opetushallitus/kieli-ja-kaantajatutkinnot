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

    // Ilmoittautumiset
    cy.findAllByText('Ilmoittautumiset').should('be.visible');
    const registeredTableHeader =
      onClerkCustomerDetailsPage.elements.registeredTableHeader;
    registeredTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    registeredTableHeader().eq(1).should('have.text', 'Tutkinto');
    registeredTableHeader().eq(2).should('have.text', 'Testipaikka');
    registeredTableHeader().eq(3).should('have.text', 'Ilmoittautumisen tila');
    registeredTableHeader().eq(4).should('have.text', 'Ilmoittautumispvm');
    registeredTableHeader().should('have.length', 5); // check no extra columns

    // Jonossa
    cy.findAllByText('Jonossa').should('be.visible');
    const queuedTableHeader =
      onClerkCustomerDetailsPage.elements.queuedTableHeader;
    queuedTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    queuedTableHeader().eq(1).should('have.text', 'Tutkinto');
    queuedTableHeader().eq(2).should('have.text', 'Testipaikka');
    queuedTableHeader().eq(3).should('have.text', 'Ilmoittautumisen tila');
    queuedTableHeader().eq(4).should('have.text', 'Ilmoittautumispvm');
    queuedTableHeader().eq(5).should('have.text', 'Jonopaikkaa tarjottu');
    queuedTableHeader().should('have.length', 6); // check no extra columns

    // Menneet tutkintotilaisuudet
    cy.findAllByText('Menneet tutkintotilaisuudet').should('be.visible');
    const pastTableHeader = onClerkCustomerDetailsPage.elements.pastTableHeader;
    pastTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    pastTableHeader().eq(1).should('have.text', 'Tutkinto');
    pastTableHeader().eq(2).should('have.text', 'Testipaikka');
    pastTableHeader().eq(3).should('have.text', 'Tila');
    pastTableHeader().should('have.length', 4); // check no extra columns
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
