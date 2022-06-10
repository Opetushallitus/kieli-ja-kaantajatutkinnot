import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';
import { selectComboBoxOptionByName } from 'tests/cypress/support/utils/comboBox';

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
    selectComboBoxOptionByName(
      this.elements.examinationTypeFilter(),
      examinationType == ExaminationType.LegalInterpreterExam
        ? 'Oikeustulkkauksen erikoisammattitutkinto'
        : 'Korkeakouluopinnot'
    );
  }

  filterByFromLanguage(lang: string) {
    selectComboBoxOptionByName(this.elements.fromLanguageFilter(), lang);
  }

  filterByToLanguage(lang: string) {
    selectComboBoxOptionByName(this.elements.toLanguageFilter(), lang);
  }

  filterByPermissionToPublish(permissionToPublish: boolean) {
    selectComboBoxOptionByName(
      this.elements.permissionToPublish(),
      permissionToPublish ? 'Kyllä' : 'Ei'
    );
  }

  filterByQualificationStatus(qualificationStatus: QualificationStatus) {
    this.elements.qualificationStatusToggleFilter(qualificationStatus).click();
  }
}

export const onClerkHomePage = new ClerkHomePage();
