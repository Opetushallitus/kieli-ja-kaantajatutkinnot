class PublicHomePage {
  elements = {
    searchButton: () =>
      cy.findByTestId('public-interpreter-filters__search-btn'),
  };

  expectSearchButtonText(text: string) {
    this.elements.searchButton().should('contain.text', text);
  }
}

export const openPublicHomePage = new PublicHomePage();
