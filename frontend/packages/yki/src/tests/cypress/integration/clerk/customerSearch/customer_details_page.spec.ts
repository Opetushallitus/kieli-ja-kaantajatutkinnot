import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';
import { customerDetails } from 'tests/msw/fixtures/customerDetails';

describe('ClerkCustomerDetailsPage', () => {
  before(() => {
    DateUtils.setDayjsLocale(AppLanguage.Finnish);
  });

  it('shows user details correctly', () => {
    const oid = '1.2.246.562.24.82364099322';
    cy.openClerkCustomerDetailsPage(oid);
    onClerkCustomerDetailsPage.isVisible(oid);
    onClerkCustomerDetailsPage.expectDetailsVisible(oid);

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
      .should('have.text', '1.9.2035');

    const queuedTableBody = onClerkCustomerDetailsPage.elements.queuedTableBody;
    queuedTableBody().should('have.length', 4);

    const pastTableBody = onClerkCustomerDetailsPage.elements.pastTableBody;
    pastTableBody().should('have.length', 3);
  });

  it('shows user details correctly, when user has no exams', () => {
    const oid = '1.2.246.562.24.82364099323';
    cy.openClerkCustomerDetailsPage(oid);
    onClerkCustomerDetailsPage.isVisible(oid);
    onClerkCustomerDetailsPage.expectDetailsVisible(oid);

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

  it('shows user details correctly, when user has no contact information', () => {
    const oid = '1.2.246.562.24.82364099324';
    const details = customerDetails.find((cd) => cd.person.oid === oid);
    if (!details) {
      throw new Error(`Could not find customerDetails with oid '${oid}'.`);
    }

    cy.openClerkCustomerDetailsPage(oid);
    onClerkCustomerDetailsPage.isVisible(oid);

    cy.findByText(details.person.ssn).should('be.visible');
    cy.findByText(details.person.oid).should('be.visible');

    cy.findByText('Suomi').should('be.visible');

    // find the whole details, by person's ssn
    // then get it's ancestor divs
    // The nearest div (same where the ssn exists) is first
    // save it as 'personDetailsContainer'
    cy.findByText(details.person.ssn)
      .parents('div')
      .first()
      .as('personDetailsContainer');

    // get 'person_details', the assert if it has 6 divs.
    cy.get('@personDetailsContainer').find('> div').should('have.length', 6);

    // ensure puhelinnumero is empty
    cy.get('@personDetailsContainer')
      .find('> div')
      .eq(3)
      .should('have.text', '');

    // ensure osoite is empty
    cy.get('@personDetailsContainer')
      .find('> div')
      .eq(4)
      .should('have.text', '');

    // ensure sähköposti is empty
    cy.get('@personDetailsContainer')
      .find('> div')
      .eq(5)
      .should('have.text', '');
  });
});
