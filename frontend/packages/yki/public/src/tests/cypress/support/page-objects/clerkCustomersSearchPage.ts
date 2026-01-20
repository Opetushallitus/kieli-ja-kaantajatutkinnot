class ClerkCustomersSearchPage {
  elements = {
    title: () => cy.findByText('Asiaskashaku'),

    table: () => cy.get('table'),
  };
}

export const onClerkCustomersSearchPage = new ClerkCustomersSearchPage();
