class ClerkQuarantinePage {
  elements = {
    heading: () => cy.findByRole('heading', { name: 'Osallistumiskiellot' }),
    tabs: () => cy.get('.clerk-quarantine__filter-tabs__tab'),
    activeTab: () => cy.get('.clerk-quarantine__filter-tabs__tab.active'),
    tableRows: () => cy.get('table tbody tr'),
  };

  isVisible() {
    this.elements.heading().should('be.visible');
  }

  expectTableRowCount(count: number) {
    this.elements.tableRows().should('have.length', count);
  }

  clickTab(tabText: string) {
    this.elements.tabs().contains(tabText).click();
  }

  expectActiveTab(tabText: string) {
    this.elements.activeTab().should('have.text', tabText);
  }

  expectCorrectRowData(index: number, data: string[]) {
    this.elements
      .tableRows()
      .eq(index)
      .within(() => {
        cy.get('td').eq(0).should('have.text', data[0]);
        cy.get('td').eq(1).should('have.text', data[1]);
        cy.get('td').eq(2).should('have.text', data[2]);
        cy.get('td').eq(3).should('have.text', data[3]);
        cy.get('td').eq(4).should('have.text', data[4]);
        cy.get('td').eq(5).should('have.text', data[5]);
        cy.get('td').eq(6).should('have.text', data[6]);
      });
  }
}

export const onClerkQuarantinePage = new ClerkQuarantinePage();
