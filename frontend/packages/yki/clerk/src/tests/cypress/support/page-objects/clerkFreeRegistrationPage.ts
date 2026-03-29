class ClerkFreeRegistrationPage {
  elements = {
    title: () => cy.findByText('Maksuttomuuden tarkastukset'),
    tableRows: () => cy.get('table tbody tr'),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  expectTableRowCount(count: number) {
    this.elements.tableRows().should('have.length', count);
  }

  clickTableRowLinkAtIndex(index: number) {
    this.elements
      .tableRows()
      .eq(index)
      .within(() => {
        cy.get('a').should('have.text', 'Tarkasta todistus').click();
      });
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
      });
  }
}

export const onClerkFreeRegistrationPage = new ClerkFreeRegistrationPage();
