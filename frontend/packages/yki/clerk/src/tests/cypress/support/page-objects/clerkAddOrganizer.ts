class ClerkAddOrganizer {
  elements = {
    searchInput: () => cy.findByTestId('organizer-search-input').find('input'),
    searchIcon: () =>
      cy.get('[data-testid="organizer-search-input"]').find('svg'),
    initialInfoText: () => cy.contains('Hae organisaatiota'),
    searchResults: () => cy.get('.clerk-add-organizer__search-result'),
    resultCount: () => cy.contains(/\d+ organisaatio?/),
    organizerName: () => cy.get('h3').first(),
    organizerAddress: () => cy.get('h3').first().next('p'),
    startDateField: () => cy.contains('Sopimus alkaa *').parent().find('input'),
    endDateField: () => cy.contains('Sopimus päättyy *').parent().find('input'),
    languageTable: () => cy.contains('Kielitutkinnot').parent().find('div'),
    contactNameField: () => cy.contains('Nimi *').parent().find('input'),
    contactEmailField: () =>
      cy.contains('Sähköpostiosoite *').parent().find('input'),
    contactPhoneField: () =>
      cy.contains('Puhelinnumero *').parent().find('input'),
    extraInfoField: () =>
      cy.findByTestId('clerk-add-organizer-extra-info-field'),
    cancelButton: () => cy.contains('button', 'Keskeytä'),
    addButton: () => cy.findByRole('button', { name: 'Lisää järjestäjä' }),
    contactNameError: () =>
      cy.contains('Nimi *').parent().find('p[class*="error"]'),
    contactEmailError: () =>
      cy.contains('Sähköpostiosoite *').parent().find('p[class*="error"]'),
    contactPhoneError: () =>
      cy.contains('Puhelinnumero *').parent().find('p[class*="error"]'),
    languageSelectionError: () => cy.contains('Valitse vähintään yksi kieli'),
  };

  expectSearchInputVisible() {
    this.elements.searchInput().should('be.visible');
  }

  expectSearchIconVisible() {
    this.elements.searchIcon().should('be.visible');
  }

  expectInitialInfoTextVisible() {
    this.elements.initialInfoText().should('be.visible');
  }

  expectDetailsFormNotVisible() {
    cy.get('h3').should('not.exist');
  }

  enterSearchQuery(query: string) {
    this.elements.searchInput().clear();
    this.elements.searchInput().should('have.text', '');
    this.elements.searchInput().type(query);
  }

  expectSearchResultsVisible() {
    this.elements.searchResults().should('exist');
  }

  expectResultCountDisplayed() {
    this.elements.resultCount().should('be.visible');
  }

  expectSearchResultsCount(count: number) {
    this.elements.searchResults().should('have.length', count);
  }

  expectSearchResultName(index: number, name: string) {
    this.elements
      .searchResults()
      .eq(index)
      .find('div')
      .first()
      .should('contain.text', name);
  }

  expectSearchResultType(index: number, type: string) {
    this.elements
      .searchResults()
      .eq(index)
      .find('div')
      .last()
      .should('contain.text', type);
  }

  clickSearchResult(index: number) {
    this.elements.searchResults().eq(index).click();
  }

  expectDetailsFormVisible() {
    this.elements.organizerName().should('be.visible');
  }

  expectOrganizationNameDisplayed(name: string) {
    this.elements.organizerName().should('contain.text', name);
  }

  expectOrganizationAddressDisplayed() {
    this.elements.organizerAddress().should('be.visible');
  }

  expectStartDateFieldVisible() {
    this.elements.startDateField().should('be.visible');
  }

  expectEndDateFieldVisible() {
    this.elements.endDateField().should('be.visible');
  }

  expectLanguageTableVisible() {
    this.elements.languageTable().should('be.visible');
  }

  expectContactFieldsVisible() {
    this.elements.contactNameField().should('be.visible');
    this.elements.contactEmailField().should('be.visible');
    this.elements.contactPhoneField().should('be.visible');
  }

  expectExtraInfoFieldVisible() {
    this.elements.extraInfoField().should('be.visible');
  }

  expectCancelButtonVisible() {
    this.elements.cancelButton().should('be.visible');
  }

  expectAddButtonVisible() {
    this.elements.addButton().should('be.visible');
  }

  enterStartDate(date: string) {
    this.elements.startDateField().type('{selectAll}{backspace}').type(date);
  }

  enterEndDate(date: string) {
    this.elements.endDateField().type('{selectAll}{backspace}').type(date);
  }

  toggleLanguageLevel(languageName: string, level: 'PERUS' | 'KESKI' | 'YLIN') {
    cy.get(`#language-row-${languageName}`)
      .parent()
      .within(() => {
        // Find the checkbox in the column corresponding to the level
        const levelIndex = { PERUS: 0, KESKI: 1, YLIN: 2 }[level];
        cy.get('input[type="checkbox"]').eq(levelIndex).click({ force: true });
      });
  }

  expectLanguageLevelChecked(
    languageName: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) {
    cy.get(`#language-row-${languageName}`)
      .parent()
      .within(() => {
        const levelIndex = { PERUS: 0, KESKI: 1, YLIN: 2 }[level];
        cy.get('input[type="checkbox"]').eq(levelIndex).should('be.checked');
      });
  }

  enterContactName(name: string) {
    this.elements.contactNameField().clear();
    this.elements.contactNameField().should('have.text', '');
    this.elements.contactNameField().type(name);
  }

  enterContactEmail(email: string) {
    this.elements.contactEmailField().clear();
    this.elements.contactEmailField().should('have.text', '');
    this.elements.contactEmailField().type(email);
  }

  enterContactPhone(phone: string) {
    this.elements.contactPhoneField().clear();
    this.elements.contactPhoneField().should('have.text', '');
    this.elements.contactPhoneField().type(phone);
  }

  enterExtraInfo(info: string) {
    this.elements.extraInfoField().clear();
    this.elements.extraInfoField().should('have.text', '');
    this.elements.extraInfoField().type(info);
  }

  clickAddButton() {
    this.elements.addButton().should('be.visible').click();
  }

  clickCancelButton() {
    this.elements.cancelButton().click();
  }

  expectContactNameError() {
    this.elements.contactNameError().should('be.visible');
  }

  expectContactNameErrorNotVisible() {
    this.elements.contactNameError().should('not.exist');
  }

  expectContactEmailError() {
    this.elements.contactEmailError().should('be.visible');
  }

  expectContactEmailErrorNotVisible() {
    this.elements.contactEmailError().should('not.exist');
  }

  expectContactPhoneError() {
    this.elements.contactPhoneError().should('be.visible');
  }

  expectContactPhoneErrorNotVisible() {
    this.elements.contactPhoneError().should('not.exist');
  }

  expectLanguageSelectionError() {
    this.elements.languageSelectionError().should('be.visible');
  }
}

export const onClerkAddOrganizer = new ClerkAddOrganizer();
