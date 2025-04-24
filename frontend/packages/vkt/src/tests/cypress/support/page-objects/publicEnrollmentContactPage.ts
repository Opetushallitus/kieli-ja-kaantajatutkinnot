class PublicEnrollmentContactPage {
  elements = {
    nextButton: () => cy.findByRole('button', { name: 'Seuraava' }),
    backButton: () => cy.findByRole('button', { name: 'Takaisin' }),
    cancelButton: () => cy.findByRole('button', { name: 'Peruuta' }),
    submitButton: () => cy.findByRole('button', { name: 'Lähetä' }),
    submitAnotherMessageButton: () =>
      cy.findByRole('button', { name: 'Lähetä toinen viesti' }),
    backToHomePageButton: () =>
      cy.findByRole('button', { name: 'Takaisin etusivulle' }),
    continueWithExistingDetailsButton: () =>
      cy.findByRole('button', { name: 'Kyllä, jatka' }),
    heading: (heading: string) => cy.findByRole('heading', { name: heading }),
    fullOrPartialExamRadioGroup: () =>
      cy.findByRole('group', {
        name: 'Haluatko suorittaa sekä suullisen että kirjallisen taidon tutkinnon? *',
      }),
    previousEnrollmentRadioGroup: () =>
      cy.findByRole('group', {
        name: 'Oletko osallistunut aiemmin hyvän ja tyydyttävän taidon kielitutkintoon? *',
      }),
    partialExamDescription: () =>
      cy.findByRole('textbox', {
        name: 'Kerro, mitkä osakokeet haluat suorittaa *',
      }),
    message: () => cy.findByRole('textbox', { name: 'Viesti *' }),
  };

  clickNext() {
    this.elements.nextButton().click();
  }

  clickCancel() {
    this.elements.cancelButton().click();
  }

  clickSubmit() {
    this.elements.submitButton().click();
  }

  expectStepHeading(heading: string) {
    this.elements.heading(heading).should('be.visible');
  }

  private selectRadioButton(radioGroup: Cypress.Chainable, value: boolean) {
    const radioButtonSelector = value ? /Kyllä.*/ : /En.*/;
    radioGroup.findByRole('radio', { name: radioButtonSelector }).click();
  }

  selectFullExam(isFullExam: boolean) {
    this.selectRadioButton(
      this.elements.fullOrPartialExamRadioGroup(),
      isFullExam,
    );
  }

  selectPreviousEnrollment(hasPreviousEnrollment: boolean) {
    this.selectRadioButton(
      this.elements.previousEnrollmentRadioGroup(),
      hasPreviousEnrollment,
    );
  }

  writePartialExamDescription(description: string) {
    this.elements.partialExamDescription().type(description);
  }

  writeMessage(message: string) {
    this.elements.message().type(message);
  }

  submitAnotherMessage() {
    this.elements.submitAnotherMessageButton().click();
  }

  clearExistingDetails() {
    this.elements.backToHomePageButton().click();
  }

  continueWithExistingDetails() {
    this.elements.continueWithExistingDetailsButton().click();
  }
}

export const onPublicEnrollmentContactPage = new PublicEnrollmentContactPage();
