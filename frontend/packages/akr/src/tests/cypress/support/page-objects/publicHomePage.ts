class PublicHomePage {
  elements = {
    title: () => cy.findByTestId('public-homepage__title-heading'),
    skipLink: () => cy.get('.skip-link'),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  focusSkipLink() {
    this.elements.skipLink().focus();
  }

  expectText(text: string) {
    cy.should('contain.text', text);
  }
}

export const onPublicHomePage = new PublicHomePage();
