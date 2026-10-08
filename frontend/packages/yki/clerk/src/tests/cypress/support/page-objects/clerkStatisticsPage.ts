class ClerkStatisticsPage {
  elements = {
    heading: () => cy.findByRole('heading', { name: 'Tilastot' }),
    downloadButton: () => cy.contains('button', 'Muodosta raportti (.xlsx)'),
    startDateInput: () =>
      cy.get('[data-testid="statistics-start-date"]').find('input'),
    endDateInput: () =>
      cy.get('[data-testid="statistics-end-date"]').find('input'),
  };

  expectHeadingVisible() {
    this.elements.heading().should('be.visible');
  }

  expectDownloadButtonVisible() {
    this.elements.downloadButton().should('be.visible');
  }

  expectDownloadButtonEnabled() {
    this.elements.downloadButton().should('not.be.disabled');
  }

  expectDownloadButtonDisabled() {
    this.elements.downloadButton().should('be.disabled');
  }

  clickDownloadButton() {
    this.elements.downloadButton().click();
  }

  clearEndDate() {
    this.elements
      .endDateInput()
      .scrollIntoView()
      .type('{selectAll}{backspace}');
  }
}

export const onClerkStatisticsPage = new ClerkStatisticsPage();
