const expectOpenLangSelectValues = (values) => {
  cy.findAllByRole('option').should('have.length', values.length);
  values.forEach((value) => cy.findAllByRole('listbox').contains(value));
};

class PublicTranslatorFilters {
  elements = {
    fromLangComboBox: () =>
      cy.findByTestId('public-translator-filters__from-language-select'),
    toLangComboBox: () =>
      cy.findByTestId('public-translator-filters__to-language-select'),
    name: () => cy.findByTestId('public-translator-filters__name-field'),
    town: () => cy.findByTestId('public-translator-filters__town-combobox'),
    empty: () => cy.findByTestId('public-translator-filters__empty-btn'),
    search: () => cy.findByTestId('public-translator-filters__search-btn'),
  };

  selectOptionByName(name: string) {
    cy.findByRole('option', { name }).scrollIntoView();
    cy.findByRole('option', { name }).should('be.visible').click();
  }

  selectFromLangByName(isPhone: boolean, from: string) {
    if (isPhone) {
      this.elements.fromLangComboBox().findByRole('combobox').select(from);
    } else {
      this.clickFromLang();
      this.selectOptionByName(from);
    }
  }

  selectToLangByName(isPhone: boolean, to: string) {
    if (isPhone) {
      this.elements.toLangComboBox().findByRole('combobox').select(to);
    } else {
      this.clickToLang();
      this.selectOptionByName(to);
    }
  }

  filterByLanguagePair(isPhone: boolean, from: string, to: string) {
    this.selectFromLangByName(isPhone, from);
    this.selectToLangByName(isPhone, to);
    this.search();
  }

  filterByName(name: string) {
    cy.clock();
    this.elements.name().should('be.visible').type(name);
    cy.tick(350); // Input debounce
    this.search();
  }

  filterByTown(town: string) {
    this.elements.town().should('be.visible').click();
    this.selectOptionByName(town);
    this.search();
  }

  fillOutName(name: string) {
    cy.clock();
    this.elements.name().should('be.visible').type(name);
    cy.tick(350);
  }

  fillOutTown(town: string) {
    this.elements.town().should('be.visible').type(town);
  }

  enterKeyOnTown() {
    this.elements.town().should('be.visible').type('{enter}');
  }

  emptySearch() {
    this.elements.empty().should('be.visible').click();
  }

  search() {
    this.elements.search().should('be.visible').click();
  }

  clickFromLang(force?: boolean) {
    this.elements.fromLangComboBox().should('be.visible').click({ force });
  }

  clickToLang(force?: boolean) {
    this.elements.toLangComboBox().should('be.visible').click({ force });
  }

  expectSearchButtonTo(assert: string) {
    this.elements.search().should('be.visible').should(assert);
  }

  expectSearchButtonText(text: string) {
    this.elements.search().should('contain.text', text);
  }

  expectFromLangSelectValues(values: Array<string>) {
    this.clickFromLang();
    expectOpenLangSelectValues(values);
  }

  expectToLangSelectValues(values: Array<string>) {
    this.clickToLang();
    expectOpenLangSelectValues(values);
  }
}

export const onPublicTranslatorFilters = new PublicTranslatorFilters();
