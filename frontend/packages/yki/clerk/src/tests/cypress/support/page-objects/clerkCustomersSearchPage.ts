class ClerkCustomersSearchPage {
  elements = {
    title: () => cy.findByText('Asiakashaku'),
    table: () => cy.get('table'),
    searchInput: () => cy.findByLabelText(/hae osallistujaa/i),
    searchButton: () => cy.findByRole('button', { name: /hae osallistujia/i }),
    totalCountHeader: () => cy.findByText(/\d+ osallistujaa/),
  };

  search(query: string) {
    if (query) {
      this.elements.searchInput().clear();
      this.elements.searchInput().type(query);
    }
    this.elements.searchButton().click();
  }

  expectTableRowCount(count: number) {
    this.elements.table().find('tbody tr').should('have.length', count);
  }

  expectNoTable() {
    cy.get('table').should('not.exist');
  }
}

export const onClerkCustomersSearchPage = new ClerkCustomersSearchPage();
