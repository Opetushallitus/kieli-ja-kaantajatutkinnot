import { selectComboBoxOptionByName } from 'tests/cypress/support/utils/comboBox';

class PublicHomePage {
  elements = {
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

  filterByToLang(lang: string) {
    selectComboBoxOptionByName(this.elements.toLangFilter(), lang);
  }

  filterByRegion(region: string) {
    selectComboBoxOptionByName(this.elements.regionFilter(), region);
  }
}

export const onPublicHomePage = new PublicHomePage();
