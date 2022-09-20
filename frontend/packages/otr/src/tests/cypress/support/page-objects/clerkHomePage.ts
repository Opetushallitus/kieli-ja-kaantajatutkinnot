import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';

class ClerkHomePage {
  elements = {
    registryHeading: () =>
      cy.findByTestId('clerk-interpreter-registry__heading'),
    examinationTypeFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__examination-type'),
    fromLanguageFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__from-lang'),
    toLanguageFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__to-lang'),
    nameField: () => cy.findByTestId('clerk-interpreter-filters__name'),
    permissionToPublish: () =>
      cy.findByTestId('clerk-interpreter-filters__permission-to-publish-basis'),
    qualificationStatusToggleFilter: (
      qualificationStatus: QualificationStatus
    ) =>
      cy.findByTestId(`clerk-interpreter-filters__btn--${qualificationStatus}`),
    resetFiltersButton: () =>
      cy.findByTestId('clerk-interpreter-registry__reset-filters-btn'),
  };

  expectTotalInterpretersCount(count: number) {
    this.elements
      .registryHeading()
      .should('contain.text', `Rekisteri(${count})`);
  }

  expectFilteredInterpretersCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByToLang(lang: string) {
    this.elements
      .toLanguageFilter()
      .should('be.visible')
      .type(lang + '{enter}');
  }

  filterByName(name: string) {
    this.elements
      .nameField()
      .should('be.visible')
      .type(name + '{enter}');
    // Ensure debounced name filter gets applied by waiting for more than 300ms
    cy.tick(400);
  }

  filterByExaminationType(examinationType: ExaminationType) {
    const value = examinationType === ExaminationType.EAT ? 'EAT' : 'KKT';

    this.elements
      .examinationTypeFilter()
      .should('be.visible')
      .type(value + '{enter}');
  }

  filterByPermissionToPublish(permissionToPublish: boolean) {
    const value = permissionToPublish ? 'Kyllä' : 'Ei';
    this.elements
      .permissionToPublish()
      .should('be.visible')
      .type(value + '{enter}');
  }

  filterByQualificationStatus(qualificationStatus: QualificationStatus) {
    this.elements
      .qualificationStatusToggleFilter(qualificationStatus)
      .should('be.visible')
      .click();
  }

  resetFilters() {
    this.elements.resetFiltersButton().click();
  }

  expectEmptyFilters() {
    this.elements.toLanguageFilter().find('div>input').should('have.value', '');
    this.elements.nameField().find('div>input').should('have.value', '');
    this.elements
      .examinationTypeFilter()
      .find('div>input')
      .should('have.value', '');
    this.elements
      .permissionToPublish()
      .find('div>input')
      .should('have.value', '');
  }
}

export const onClerkHomePage = new ClerkHomePage();
