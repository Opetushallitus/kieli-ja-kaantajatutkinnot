export const compulsoryLangs = ['suomi', 'ruotsi'];

class PublicTranslatorFilters {
  elements = {
    fromLang: () =>
      cy.findByTestId('public-translator-filters__from-language-select'),
    toLang: () =>
      cy.findByTestId('public-translator-filters__to-language-select'),
    name: () => cy.findByTestId('public-translator-filters__name-field'),
    town: () => cy.findByTestId('public-translator-filters__town-combobox'),
    empty: () => cy.findByTestId('public-translator-filters__empty-btn'),
    search: () => cy.findByTestId('public-translator-filters__search-btn'),
  };

  selectOptionByName(name: string) {
    cy.findByRole('option', { name }).click();
  }

  selectFromLangByName(from: string) {
    this.clickFromLang();
    this.selectOptionByName(from);
  }

  selectToLangByName(to: string) {
    this.clickToLang();
    this.selectOptionByName(to);
  }

  filterByLanguagePair(from: string, to: string) {
    this.selectFromLangByName(from);
    this.selectToLangByName(to);
    this.search();
  }

  filterByName(name: string) {
    this.elements.name().type(name);
    cy.wait(350); // Input debounce
    this.search();
  }

  filterByTown(town: string) {
    this.elements.town().click();
    this.selectOptionByName(town);
    this.search();
  }

  fillOutName(name: string) {
    this.elements.name().type(name);
  }

  fillOutTown(town: string) {
    this.elements.town().type(town);
  }

  enterKeyOnTown() {
    this.elements.town().type('{enter}');
  }

  emptySearch() {
    this.elements.empty().click();
  }

  search() {
    this.elements.search().click();
  }

  clickFromLang() {
    this.elements.fromLang().click();
  }

  clickToLang() {
    this.elements.toLang().click();
  }

  expectSearchButtonTo(assert: string) {
    this.elements.search().should(assert);
  }

  expectSeachBtnText(text: string) {
    this.elements.search().should('contain.text', text);
  }

  expectFromLangSelectValues(values: Array<string>) {
    this.clickFromLang();
    cy.findAllByRole('option').should('have.length', values.length);
    values.forEach((value) => cy.findAllByRole('listbox').contains(value));
  }
  expectToLangSelectValues(values: Array<string>) {
    this.clickToLang();
    cy.findAllByRole('option').should('have.length', values.length);
    values.forEach((value) => cy.findAllByRole('listbox').contains(value));
  }
}

export const onPublicTranslatorFilters = new PublicTranslatorFilters();
