class ModifyAgreementModal {
  elements = {
    modal: () => cy.get('.custom-modal'),
    modalTitle: () =>
      cy
        .get('.custom-modal-title')
        .findByRole('heading', { name: 'Muokkaa sopimusta' }),
    closeButton: () => cy.get('svg[data-testid="CloseIcon"]').first(),
    organizerName: (name: string) =>
      cy.get('.custom-modal').findByRole('heading', { level: 3, name }),
    startDateLabel: () =>
      cy.get('.custom-modal').contains('span', 'Sopimus alkaa *'),
    startDateInput: () =>
      cy
        .get('.custom-modal')
        .contains('span', 'Sopimus alkaa *')
        .parent()
        .find('input'),
    endDateLabel: () =>
      cy.get('.custom-modal').contains('span', 'Sopimus päättyy *'),
    endDateInput: () =>
      cy
        .get('.custom-modal')
        .contains('span', 'Sopimus päättyy *')
        .parent()
        .find('input'),
    languagesLabel: () =>
      cy
        .get('.custom-modal')
        .within(() => cy.contains('span', 'Kielitutkinnot')),
    languageList: () =>
      cy
        .get('.custom-modal')
        .within(() =>
          cy
            .contains('span', 'Kielitutkinnot')
            .parent()
            .find('[style*="flex"]')
            .last(),
        ),
    languageCheckbox: (
      languageName: string,
      level: 'PERUS' | 'KESKI' | 'YLIN',
    ) =>
      cy
        .get(`#language-row-${languageName}`)
        .find('input[type="checkbox"]')
        .parent()
        .eq(ModifyAgreementModal.getLevelIndex(level)),
    cancelButton: () =>
      cy
        .get('.custom-modal')
        .findByRole('button', { name: 'Peruuta' })
        .scrollIntoView(),
    saveButton: () =>
      cy
        .get('.custom-modal')
        .findByRole('button', { name: 'Tallenna muutokset' })
        .scrollIntoView(),
    startDateError: () =>
      cy.get('.custom-modal').contains('p', 'Valitse sopimuksen alkamispäivä'),
    datePickerDialog: () => cy.get('.custom-modal').get('[role="dialog"]'),
    datePickerDay: (day: string) =>
      cy
        .get('.custom-modal')
        .within(() =>
          cy
            .get('[role="dialog"] button')
            .not('[aria-label*="previous"]')
            .not('[aria-label*="next"]')
            .contains(day),
        ),
  };

  private static getLevelIndex(level: 'PERUS' | 'KESKI' | 'YLIN'): number {
    const levelMap = { PERUS: 0, KESKI: 1, YLIN: 2 };

    return levelMap[level];
  }

  expectModalVisible() {
    this.elements.modal().should('be.visible');
  }

  expectModalNotVisible() {
    this.elements.modal().should('not.exist');
  }

  expectOrganizerNameDisplayed(organizerName: string) {
    this.elements
      .organizerName(organizerName)
      .should('contain.text', organizerName);
  }

  expectStartDateFieldVisible() {
    this.elements.startDateInput().should('be.visible');
  }

  expectEndDateFieldVisible() {
    this.elements.endDateInput().should('be.visible');
  }

  expectLanguagesFieldVisible() {
    this.elements.languagesLabel().should('be.visible');
  }

  clearStartDate() {
    this.elements.startDateInput().clear();
  }

  clearEndDate() {
    this.elements.endDateInput().clear();
  }

  enterStartDate(date: string) {
    this.elements.startDateInput().type('{selectAll}{backspace}').type(date);
  }

  enterEndDate(date: string) {
    this.elements.endDateInput().type('{selectAll}{backspace}').type(date);
  }

  getStartDateValue() {
    return this.elements.startDateInput().then(($input) => {
      return ($input.val() as string) || '';
    });
  }

  getEndDateValue() {
    return this.elements.endDateInput().then(($input) => {
      return ($input.val() as string) || '';
    });
  }

  expectStartDateValue(expectedValue: string) {
    this.elements.startDateInput().should('have.value', expectedValue);
  }

  expectEndDateValue(expectedValue: string) {
    this.elements.endDateInput().should('have.value', expectedValue);
  }

  clickStartDateInput() {
    this.elements.startDateInput().click();
  }

  clickEndDateInput() {
    this.elements.endDateInput().click();
  }

  selectDateFromPicker(day: string) {
    this.elements.datePickerDay(day).click();
  }

  closeDatePicker() {
    cy.get('body').type('{esc}');
  }

  toggleLanguageLevel(languageName: string, level: 'PERUS' | 'KESKI' | 'YLIN') {
    this.elements
      .languageCheckbox(languageName, level)
      .find('input[type="checkbox"]')
      .click();
  }

  expectLanguageLevelChecked(
    languageName: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) {
    this.elements
      .languageCheckbox(languageName, level)
      .find('input[type="checkbox"]')
      .should('be.checked');
  }

  expectLanguageLevelNotChecked(
    languageName: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) {
    this.elements
      .languageCheckbox(languageName, level)
      .find('input[type="checkbox"]')
      .should('not.be.checked');
  }

  expectSaveButtonEnabled() {
    this.elements.saveButton().should('not.be.disabled');
  }

  expectSaveButtonDisabled() {
    this.elements.saveButton().should('be.disabled');
  }

  expectCancelButtonVisible() {
    this.elements.cancelButton().should('be.visible');
  }

  expectStartDateErrorMessageVisible() {
    this.elements.startDateError().should('be.visible');
  }

  expectStartDateErrorMessageNotVisible() {
    this.elements.startDateError().should('not.exist');
  }

  clickSaveButton() {
    this.elements.saveButton().click();
  }

  clickCancelButton() {
    this.elements.cancelButton().click();
  }

  clickCloseButton() {
    this.elements.closeButton().click();
  }

  expectLanguageListVisible() {
    this.elements.languageList().should('be.visible');
  }
}

export const onModifyAgreementModal = new ModifyAgreementModal();
