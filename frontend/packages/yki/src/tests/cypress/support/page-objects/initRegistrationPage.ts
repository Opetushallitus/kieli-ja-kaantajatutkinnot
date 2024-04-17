class InitRegistrationPage {
  elements = {
    continueToRegistrationButton: () =>
      cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }),
    title: () => cy.findByRole('heading', { level: 1 }),
  };

  expectVisibleContinueToRegistrationButton() {
    this.elements.continueToRegistrationButton().should('be.visible');
  }

  expectTitle(title: string) {
    this.elements.title().should('have.text', title);
  }
}

export const onInitRegistrationPage = new InitRegistrationPage();
