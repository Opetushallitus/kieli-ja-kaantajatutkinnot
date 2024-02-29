import { selectComboBoxOptionByName } from 'tests/cypress/support/utils/comboBox';

class PublicRegistrationPage {
  elements = {
    filterByLanguage: () =>
      cy.findByRole('combobox', { name: /Valitse kieli/ }),
    filterByLevel: () => cy.findByRole('combobox', { name: /Valitse taso/ }),
    resultBox: () =>
      cy.findByTestId('public-registration-page__grid-container__result-box'),
    showOnlyIfAvailablePlaces: () =>
      cy.findByLabelText('Näytä vain kielitutkinnot, joissa on tilaa'),
    showOnlyIfOngoingAdmission: () =>
      cy.findByLabelText(
        'Näytä vain kielitutkinnot, joihin voi ilmoittautua nyt',
      ),
    searchButton: () => cy.findByRole('button', { name: /Hae/ }),
    title: () => cy.findByTestId('public-registration-page__title-heading'),
  };

  expectResultsCount(count: number) {
    const resultsLabelSuffix =
      count === 0
        ? 'ei tuloksia'
        : count === 1
        ? '1 tulos'
        : `${count} tulosta`;
    this.elements
      .resultBox()
      .findByRole('heading', { name: `Tulokset (${resultsLabelSuffix})` })
      .should('exist');
  }

  expectResultRowsCount(count: number) {
    return this.getResultRows().should('have.length', count);
  }

  getResultRows() {
    return this.elements.resultBox().find('tbody').findAllByRole('row');
  }

  isVisible() {
    this.elements.title().should('be.visible');
  }

  selectExamLanguage(language: string) {
    selectComboBoxOptionByName(this.elements.filterByLanguage(), language);
  }

  selectExamLevel(level: string) {
    selectComboBoxOptionByName(this.elements.filterByLevel(), level);
  }

  search() {
    this.elements.searchButton().should('not.be.disabled');
    this.elements.searchButton().click();
  }

  toggleShowOnlyIfAvailablePlaces() {
    this.elements.showOnlyIfAvailablePlaces().click();
  }

  toggleShowOnlyIfOngoingAdmission() {
    this.elements.showOnlyIfOngoingAdmission().click();
  }
}

export const onPublicRegistrationPage = new PublicRegistrationPage();
