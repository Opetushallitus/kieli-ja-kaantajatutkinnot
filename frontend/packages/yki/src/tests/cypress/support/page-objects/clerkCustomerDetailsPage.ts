import { customerDetails } from 'tests/msw/fixtures/customerDetails';

class ClerkCustomerDetailsPage {
  elements = {
    title: (id: number) => {
      const person = customerDetails[id - 1].person;

      return cy.findByText(`${person.lastName} ${person.firstName}`);
    },
  };
  isVisible(id: number) {
    this.elements.title(id).should('be.visible');
  }

  expectDetailsVisible(id: number) {
    const details = customerDetails[id - 1];

    cy.findByText(details.person.ssn).should('be.visible');
    cy.findByText(details.person.oid).should('be.visible');

    cy.findByText('Suomi').should('be.visible');

    // Asiointikieli ja Todistuksen kieli
    cy.findAllByText('suomi').eq(1).should('be.visible');

    cy.findByText(details.person.phoneNumber).should('be.visible');
    cy.findByText(details.person.streetAddress).should('be.visible');

    cy.contains('a', details.person.email)
      .should('have.attr', 'href')
      .and('include', `mailto:${details.person.email}`);
  }
}

export const onClerkCustomerDetailsPage = new ClerkCustomerDetailsPage();
