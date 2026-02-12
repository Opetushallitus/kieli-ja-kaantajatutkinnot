import { customerDetails } from 'tests/msw/fixtures/customerDetails';

class ClerkCustomerDetailsPage {
  elements = {
    title: (oid: string) => {
      const details = customerDetails.find((cd) => cd.person.oid === oid);

      return cy.findByText(
        `${details.person.lastName} ${details.person.firstName}`,
      );
    },

    // Ilmoitttautumiset
    registeredTableHeader: () => cy.get('table').eq(0).find('thead tr th'),
    registeredTableBody: () => cy.get('table').eq(0).find('tbody tr'),

    // Jonossa
    queuedTableHeader: () => cy.get('table').eq(1).find('thead tr th'),
    queuedTableBody: () => cy.get('table').eq(1).find('tbody tr'),

    // Menneet
    pastTableHeader: () => cy.get('table').eq(2).find('thead tr th'),
    pastTableBody: () => cy.get('table').eq(2).find('tbody tr'),
  };
  isVisible(oid: string) {
    this.elements.title(oid).should('be.visible');
  }

  expectDetailsVisible(oid: string) {
    const details = customerDetails.find((cd) => cd.person.oid === oid);
    if (!details) {
      throw new Error(`Could not find customerDetails with oid '${oid}'.`);
    }

    cy.findByText(details.person.ssn).should('be.visible');
    cy.findByText(details.person.oid).should('be.visible');

    cy.findByText('Suomi').should('be.visible');

    cy.findByText(details.person.phoneNumber).should('be.visible');

    cy.findByText(
      [
        details.person.streetAddress,
        details.person.zip,
        details.person.postOffice,
      ]
        .filter((v) => !!v)
        .join(', '),
    ).should('be.visible');

    cy.contains('a', details.person.email)
      .should('have.attr', 'href')
      .and('include', `mailto:${details.person.email}`);
  }

  // Ilmoittautumiset
  expectRegisteredTableHeadersVisible() {
    cy.findAllByText('Ilmoittautumiset').should('be.visible');
    const registeredTableHeader = this.elements.registeredTableHeader;
    registeredTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    registeredTableHeader().eq(1).should('have.text', 'Tutkinto');
    registeredTableHeader().eq(2).should('have.text', 'Testipaikka');
    registeredTableHeader().eq(3).should('have.text', 'Ilmoittautumisen tila');
    registeredTableHeader().eq(4).should('have.text', 'Ilmoittautumispvm');
    registeredTableHeader().should('have.length', 5); // check no extra columans
  }

  // Jonossa
  expectedQueuedTableHeadersVisible() {
    cy.findAllByText('Jonossa').should('be.visible');
    const queuedTableHeader = this.elements.queuedTableHeader;
    queuedTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    queuedTableHeader().eq(1).should('have.text', 'Tutkinto');
    queuedTableHeader().eq(2).should('have.text', 'Testipaikka');
    queuedTableHeader().eq(3).should('have.text', 'Ilmoittautumisen tila');
    queuedTableHeader().eq(4).should('have.text', 'Ilmoittautumispvm');
    queuedTableHeader().eq(5).should('have.text', 'Jonopaikkaa tarjottu');
    queuedTableHeader().should('have.length', 6); // check no extra columns
  }

  // Menneet tutkintotilaisuudet
  expectPastTableHeadersVisible() {
    cy.findAllByText('Menneet tutkintotilaisuudet').should('be.visible');
    const pastTableHeader = this.elements.pastTableHeader;
    pastTableHeader().eq(0).should('have.text', 'Tutkintopäivä');
    pastTableHeader().eq(1).should('have.text', 'Tutkinto');
    pastTableHeader().eq(2).should('have.text', 'Testipaikka');
    pastTableHeader().eq(3).should('have.text', 'Tila');
    pastTableHeader().should('have.length', 4); // check no extra columns
  }
}

export const onClerkCustomerDetailsPage = new ClerkCustomerDetailsPage();
