import { customerDetails } from 'tests/msw/fixtures/customerDetails';

class ClerkCustomerDetailsPage {
  elements = {
    title: (id: number) => cy.findByText(customerDetails[id - 1].person.name),
  };
  isVisible(id: number) {
    this.elements.title(id).should('be.visible');
  }
}

export const onClerkCustomerDetailsPage = new ClerkCustomerDetailsPage();
