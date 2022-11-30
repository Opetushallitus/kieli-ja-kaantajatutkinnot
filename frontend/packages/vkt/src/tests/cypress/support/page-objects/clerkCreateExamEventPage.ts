class ClerkCreateEventPage {
  elements = {
    languageLevelInput: () =>
      cy.findByTestId('clerk-exam__event-information__lang-and-level'),
    dateInput: () =>
      cy.findByTestId('clerk-exam__event-information__date').find('input'),
    registrationInput: () =>
      cy
        .findByTestId('clerk-exam__event-information__registration')
        .find('input'),
    maxParticipantsInput: () =>
      cy.findByTestId('clerk-exam__event-information__max-participants'),
    isDatePublicToggle: () =>
      cy.findByTestId('clerk-exam__event-information__show-public-dates'),
    saveButton: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__save-btn'
      ),
    backButton: () => cy.findByTestId('clerk-create-exam__back-btn'),
  };

  inputLanguageAndLevel(text: string) {
    this.elements
      .languageLevelInput()
      .should('be.visible')
      .type(text + '{enter}');
  }

  inputExamDate(date: string) {
    this.elements.dateInput().should('be.visible').type(date);
  }

  inputRegistrationClosesDate(date: string) {
    this.elements.registrationInput().should('be.visible').type(date);
  }

  inputMaxParticipants(max: number) {
    this.elements
      .maxParticipantsInput()
      .should('be.visible')
      .type(max + '{enter}');
  }

  clickIsHiddenToggle() {
    this.elements.isDatePublicToggle().should('be.visible').click();
  }

  clickBackButton() {
    this.elements.backButton().should('be.visible').click();
  }

  saveButtonEnabledIs(enabled: boolean) {
    const button = this.elements.saveButton();

    enabled ? button.should('be.enabled') : button.should('be.disabled');
  }
}

export const onClerkCreateEventPage = new ClerkCreateEventPage();
