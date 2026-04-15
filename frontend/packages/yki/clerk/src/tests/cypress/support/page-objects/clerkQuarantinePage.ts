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
        data.forEach((value, i) => {
          cy.get('td').eq(i).should('have.text', value);
        });
      });
  }
}

export const onClerkQuarantinePage = new ClerkQuarantinePage();
