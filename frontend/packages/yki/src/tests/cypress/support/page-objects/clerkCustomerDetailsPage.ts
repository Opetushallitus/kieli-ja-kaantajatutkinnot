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
}

export const onClerkCustomerDetailsPage = new ClerkCustomerDetailsPage();
