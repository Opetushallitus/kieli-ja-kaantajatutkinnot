import { AuthorisationStatus } from 'enums/clerkTranslator';
import { AuthorisationBasis } from 'interfaces/authorisation';

class ClerkHomePage {
  elements = {
    registryHeading: () =>
      cy.findByTestId('clerk-translator-registry__heading'),
    authorisationStatusButton: (status: AuthorisationStatus) =>
      cy.findByTestId(`clerk-translator-filters__btn--${status}`),
    sendEmailButton: () =>
      cy.findByTestId('clerk-translator-registry__send-email-btn'),
    translatorRow: (id: string) =>
      cy.findByTestId(`clerk-translators__id-${id}-row`),
    authorisationBasisSelect: () =>
      cy.findByTestId('clerk-translator-filters__authorisation-basis'),
    permissionToPublishBasisSelect: () =>
      cy.findByTestId('clerk-translator-filters__permission-to-publish-basis'),
    fromLanguageSelect: () =>
      cy.findByTestId('clerk-translator-filters__from-lang'),
    toLanguageSelect: () =>
      cy.findByTestId('clerk-translator-filters__to-lang'),
    nameField: () => cy.findByTestId('clerk-translator-filters__name'),
    resetFiltersButton: () =>
      cy.findByTestId('clerk-translator-registry__reset-filters-btn'),
  };

  expectTotalTranslatorsCount(count: number) {
    this.elements
      .registryHeading()
      .should('contain.text', `Rekisteri(${count})`);
  }

  expectSelectedTranslatorsCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByAuthorisationStatus(status: AuthorisationStatus) {
    this.elements.authorisationStatusButton(status).click();
  }

  filterByAuthorisationBasis(basis: AuthorisationBasis) {
    this.elements.authorisationBasisSelect().type(basis + '{enter}');
  }

  filterByPermissionToPublishBasis(permissionToPublish: boolean) {
    const basis = permissionToPublish ? 'Kyllä' : 'Ei';
    this.elements.permissionToPublishBasisSelect().type(basis + '{enter}');
  }

  filterByFromLang(lang: string) {
    this.elements.fromLanguageSelect().type(lang + '{enter}');
  }

  filterByToLang(lang: string) {
    this.elements.toLanguageSelect().type(lang + '{enter}');
  }

  filterByName(name: string) {
    this.elements.nameField().type(name + '{enter}');
    // Ensure debounced name filter gets applied by waiting for more than 300ms
    cy.tick(400);
  }

  sendEmail() {
    this.elements.sendEmailButton().click();
  }

  resetFilters() {
    this.elements.resetFiltersButton().click();
  }

  selectTranslatorById(id: string) {
    this.elements.translatorRow(id).click();
  }

  clickTranslatorOverviewLink(id: number) {
    this.elements
      .translatorRow(`${id}`)
      .findByTestId(`clerk-translators__id-${id}-more-btn`)
      .click({ force: true });
  }

  expectEmptyFilters() {
    this.elements
      .fromLanguageSelect()
      .find('div>input')
      .should('have.value', '');
    this.elements.toLanguageSelect().find('div>input').should('have.value', '');
    this.elements.nameField().find('div>input').should('have.value', '');
    this.elements
      .authorisationBasisSelect()
      .find('div>input')
      .should('have.value', '');
    this.elements
      .permissionToPublishBasisSelect()
      .find('div>input')
      .should('have.value', '');
  }
}

export const onClerkHomePage = new ClerkHomePage();
