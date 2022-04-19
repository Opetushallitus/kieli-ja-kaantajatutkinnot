class PublicHomePage {
  elements = { title: () => cy.findByTestId('homepage__title-heading') };

  isVisible() {
    this.elements.title().should('be.visible');
  }
}

export const onPublicHomePage = new PublicHomePage();
