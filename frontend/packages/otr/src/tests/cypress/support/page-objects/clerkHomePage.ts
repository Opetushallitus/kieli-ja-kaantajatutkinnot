import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';

class ClerkHomePage {
  elements = {
    examinationTypeFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__examination-type'),
    fromLanguageFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__from-lang'),
    permissionToPublish: () =>
      cy.findByTestId('clerk-interpreter-filters__permission-to-publish-basis'),
    toLanguageFilter: () =>
      cy.findByTestId('clerk-interpreter-filters__to-lang'),
    qualificationStatusToggleFilter: (
      qualificationStatus: QualificationStatus
    ) =>
      cy.findByTestId(`clerk-interpreter-filters__btn--${qualificationStatus}`),
  };

  expectFilteredInterpretersCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByExaminationType(examinationType: ExaminationType) {
    const value =
      examinationType === ExaminationType.LegalInterpreterExam
        ? 'Oikeustulkkauksen erikoisammattitutkinto'
        : 'Korkeakouluopinnot';

    this.elements
      .examinationTypeFilter()
      .should('be.visible')
      .type(value + '{enter}');
  }

  filterByToLanguage(lang: string) {
    this.elements
      .toLanguageFilter()
      .should('be.visible')
      .type(lang + '{enter}');
  }

  filterByPermissionToPublish(permissionToPublish: boolean) {
    const value = permissionToPublish ? 'Kyllä' : 'Ei';
    this.elements
      .permissionToPublish()
      .should('be.visible')
      .type(value + '{enter}');
  }

  filterByQualificationStatus(qualificationStatus: QualificationStatus) {
    this.elements.qualificationStatusToggleFilter(qualificationStatus).click();
  }
}

export const onClerkHomePage = new ClerkHomePage();
