import { selectComboBoxOptionByName } from 'tests/cypress/support/utils/comboBox';

class PublicHomePage {
  elements = {
    nameFilter: () => cy.findByTestId('public-interpreter-filters__name-field'),
    regionFilter: () =>
      cy.findByTestId('public-interpreter-filters__region-combobox'),
    searchButton: () =>
      cy.findByTestId('public-interpreter-filters__search-btn'),
    toLangFilter: () =>
      cy.findByTestId('public-interpreter-filters__to-language-select'),
  };

  expectFilteredInterpretersCount(count: number) {
    this.elements
      .searchButton()
      .should('contain.text', `Näytä tulokset (${count})`);
  }

  filterByName(name: string) {
    this.elements.nameFilter().clear().type(name);
    // Wait for the 300ms debounce to clear.
    cy.tick(300);
  }

  filterByRegion(region: string) {
    selectComboBoxOptionByName(this.elements.regionFilter(), region);
  }

  filterByToLang(lang: string) {
    selectComboBoxOptionByName(this.elements.toLangFilter(), lang);
  }
}

export const onPublicHomePage = new PublicHomePage();
