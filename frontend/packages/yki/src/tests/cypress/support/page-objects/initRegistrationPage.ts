class InitRegistrationPage {
  elements = {
    title: () => cy.findByRole('heading', { level: 1 }),
  };

  expectTitle(title: string) {
    this.elements.title().should('have.text', title);
  }
}

export const onInitRegistrationPage = new InitRegistrationPage();
