class PublicRegistrationPage {
  elements = {
    title: () => cy.findByTestId('public-registration-page__title-heading'),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }
}

export const onPublicRegistrationPage = new PublicRegistrationPage();
