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
    cy.findByRole('option', { name }).should('be.visible').click();
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
    this.elements.name().should('be.visible').type(name);
    cy.wait(350); // Input debounce
    this.search();
  }

  filterByTown(town: string) {
    this.elements.town().should('be.visible').click();
    this.selectOptionByName(town);
    this.search();
  }

  fillOutName(name: string) {
    this.elements.name().should('be.visible').type(name);
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

  clickFromLang() {
    this.elements.fromLang().should('be.visible').click();
  }

  clickToLang() {
    this.elements.toLang().should('be.visible').click();
  }

  expectSearchButtonTo(assert: string) {
    this.elements.search().should('be.visible').should(assert);
  }

  expectSeachBtnText(text: string) {
    this.elements.search().should('be.visible').should('contain.text', text);
  }

  expectFromLangSelectValues(values: Array<string>) {
    this.clickFromLang();
    cy.findAllByRole('option')
      .should('be.visible')
      .should('have.length', values.length);
    values.forEach((value) => cy.findAllByRole('listbox').contains(value));
  }
  expectToLangSelectValues(values: Array<string>) {
    this.clickToLang();
    cy.findAllByRole('option')
      .should('be.visible')
      .should('have.length', values.length);
    values.forEach((value) => cy.findAllByRole('listbox').contains(value));
  }
}

export const onPublicTranslatorFilters = new PublicTranslatorFilters();
