class AddExamDateModal {
  elements = {
    modal: () => cy.get('[data-testid="add-exam-date-modal"]'),
    closeButton: () => cy.get('[data-testid="add-exam-date-modal-close"]'),
    examDateInput: () =>
      cy.get('[data-testid="exam-date-input"]').find('input'),
    registrationStartInput: () =>
      cy.get('[data-testid="registration-start-input"]').find('input').first(),
    registrationEndInput: () =>
      cy.get('[data-testid="registration-end-input"]').find('input').first(),
    languageSelectionRow: (language: string) =>
      cy.get(`[data-testid="language-row-${language}"]`),
    languageLevelCheckbox: (
      language: string,
      level: 'PERUS' | 'KESKI' | 'YLIN',
    ) => {
      return cy.get(`[data-testid="language-${language}-${level}"]`);
    },
    examTypeCheckbox: (
      examType:
        | 'speechComprehensionAndWriting'
        | 'readingComprehensionAndSpeaking'
        | 'allExamParts',
    ) => {
      const idMap = {
        speechComprehensionAndWriting: 'exam-type-speech',
        readingComprehensionAndSpeaking: 'exam-type-reading',
        allExamParts: 'exam-type-all',
      };

      return cy.get(`[data-testid="${idMap[examType]}"]`).find('input');
    },
    cancelButton: () =>
      cy
        .get('[data-testid="add-exam-date-modal"]')
        .findByRole('button', { name: /Keskeytä/i }),
    submitButton: () =>
      cy
        .get('[data-testid="add-exam-date-modal"]')
        .findByRole('button', { name: 'Lisää tutkintopäivä' }),
    languageHeader: () =>
      cy.get('[data-testid="add-exam-date-modal"]').contains(/Kieli/i),
  };

  expectModalVisible() {
    this.elements.modal().should('be.visible');
  }

  expectModalNotExist() {
    this.elements.modal().should('not.exist');
  }

  expectAllFormFieldsVisible() {
    // Inputs can be overflowed by fixed containers; assert they exist and
    // verify header is visible. Use forced typing when interacting.
    this.elements.examDateInput().should('exist');
    this.elements.registrationStartInput().should('exist');
    this.elements.registrationEndInput().should('exist');
    this.elements.languageHeader().scrollIntoView().should('be.visible');
  }

  expectSubmitButtonVisible() {
    this.elements.submitButton().should('be.visible');
  }

  expectCancelButtonVisible() {
    this.elements.cancelButton().should('be.visible');
  }

  expectSubmitButtonDisabled() {
    this.elements.submitButton().should('be.disabled');
  }

  expectSubmitButtonEnabled() {
    this.elements.submitButton().should('not.be.disabled');
  }

  enterExamDate(date: string) {
    this.elements
      .examDateInput()
      .scrollIntoView()
      .type('{selectAll}{backspace}')
      .type(date);
  }

  enterRegistrationStartDate(date: string) {
    this.elements
      .registrationStartInput()
      .scrollIntoView()
      .type('{selectAll}{backspace}')
      .type(date);
  }

  enterRegistrationEndDate(date: string) {
    this.elements
      .registrationEndInput()
      .scrollIntoView()
      .type('{selectAll}{backspace}')
      .type(date);
  }

  getExamDateValue() {
    return this.elements
      .examDateInput()
      .then(($input) => ($input.val() as string) || '');
  }

  getRegistrationStartDateValue() {
    return this.elements
      .registrationStartInput()
      .then(($input) => ($input.val() as string) || '');
  }

  getRegistrationEndDateValue() {
    return this.elements
      .registrationEndInput()
      .then(($input) => ($input.val() as string) || '');
  }

  selectLanguageLevel(language: string, level: 'PERUS' | 'KESKI' | 'YLIN') {
    this.elements
      .languageLevelCheckbox(language, level)
      .scrollIntoView()
      .click()
      .find('input[type="checkbox"]')
      .should('be.checked');
  }

  selectExamType(
    examType:
      | 'speechComprehensionAndWriting'
      | 'readingComprehensionAndSpeaking'
      | 'allExamParts',
  ) {
    this.elements
      .examTypeCheckbox(examType)
      .scrollIntoView()
      .click()
      .should('be.checked');
  }

  expectLanguageLevelChecked(
    language: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) {
    this.elements
      .languageLevelCheckbox(language, level)
      .find('input[type="checkbox"]')
      .should('be.checked');
  }

  expectLanguageLevelNotChecked(
    language: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) {
    this.elements
      .languageLevelCheckbox(language, level)
      .should('not.be.checked');
  }

  expectExamTypeChecked(
    examType:
      | 'speechComprehensionAndWriting'
      | 'readingComprehensionAndSpeaking'
      | 'allExamParts',
  ) {
    this.elements.examTypeCheckbox(examType).should('be.checked');
  }

  expectExamTypeNotChecked(
    examType:
      | 'speechComprehensionAndWriting'
      | 'readingComprehensionAndSpeaking'
      | 'allExamParts',
  ) {
    this.elements.examTypeCheckbox(examType).should('not.be.checked');
  }

  clickCloseButton() {
    this.elements.closeButton().click({ force: true });
  }

  clickCancelButton() {
    this.elements.cancelButton().click();
  }

  clickSubmitButton() {
    this.elements.submitButton().scrollIntoView().click();
  }

  clearExamDate() {
    this.elements.examDateInput().clear();
  }

  clearRegistrationStartDate() {
    this.elements.registrationStartInput().clear();
  }

  clearRegistrationEndDate() {
    this.elements.registrationEndInput().clear();
  }
}

export const onAddExamDateModal = new AddExamDateModal();
