class PublicHomePage {
  elements = {
    title: () => cy.findByTestId('public-homepage__title-heading'),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }
}

export const onPublicHomePage = new PublicHomePage();
