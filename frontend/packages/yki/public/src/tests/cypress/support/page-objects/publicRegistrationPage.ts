import { selectComboBoxOptionByName } from 'tests/cypress/support/utils/comboBox';

class PublicRegistrationPage {
  elements = {
    filterByLanguage: (isPhone: boolean = false) =>
      isPhone
        ? cy.findAllByRole('combobox').eq(0).should('be.visible')
        : cy.findByRole('combobox', { name: /Valitse kieli/ }),
    filterByLevel: (isPhone: boolean = false) =>
      isPhone
        ? cy.findAllByRole('combobox').eq(1).should('be.visible')
        : cy.findByRole('combobox', { name: /Valitse taso/ }),
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

  expectResultCardsCount(count: number) {
    return this.getResultCards().should('have.length', count);
  }

  getResultCards() {
    return this.elements.resultBox().find('.exam-session-card');
  }

  getResultCardsNth(nth: number) {
    return this.elements.resultBox().find('.exam-session-card').eq(nth);
  }

  alertModalContains(text: string) {
    return cy
      .findAllByRole('alertdialog')
      .findByTestId('registration-error-modal-description')
      .should('include.text', text);
  }

  isVisible() {
    this.elements.title().should('be.visible');
  }

  selectExamLanguage(language: string, isPhone: boolean = false) {
    selectComboBoxOptionByName(
      this.elements.filterByLanguage(isPhone),
      language,
      isPhone,
    );
  }

  selectExamLevel(level: string, isPhone: boolean = false) {
    selectComboBoxOptionByName(
      this.elements.filterByLevel(isPhone),
      level,
      isPhone,
    );
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

  expectReservationTimerText(visible, text?) {
    if (visible) {
      cy.findByTestId('public-registration__reservation-timer-text')
        .should('be.visible')
        .and('have.text', text);
    } else {
      cy.findByTestId('public-registration__reservation-timer-text').should(
        'not.exist',
      );
    }
  }
}

export const onPublicRegistrationPage = new PublicRegistrationPage();
