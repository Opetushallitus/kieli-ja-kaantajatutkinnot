import { ExamLanguage } from 'enums/app';

class PublicGoodAndSatisfactoryLevelPage {
  elements = {
    examinersTable: () =>
      cy
        .findByRole('heading', {
          name: 'Ota yhteyttä tutkintosuorituksen vastaanottajiin',
        })
        .siblings('table')
        .first(),
    examinerRow: (examinerName: string) =>
      this.elements
        .examinersTable()
        .findAllByRole('cell', { name: examinerName })
        .parent(),
    languageFilter: () =>
      cy.findByRole('group', { name: 'Näytä seuraavien kielten tutkinnot:' }),
  };

  filterExaminersByExamLanguage(language: ExamLanguage) {
    const label =
      language === ExamLanguage.FI
        ? 'Suomi'
        : language === ExamLanguage.SV
          ? 'Ruotsi'
          : 'Molemmat kielet';
    this.elements.languageFilter().findByRole('radio', { name: label }).click();
  }

  expectFilteredExaminersCount(count: number) {
    // Expect number of table rows to be count + 1, as the table header is also considered a row.
    this.elements
      .examinersTable()
      .findAllByRole('row')
      .should('have.length', count + 1);
  }

  assertExaminerAlreadyContacted(examinerName: string) {
    this.elements
      .examinerRow(examinerName)
      .should('contain.text', 'Yhteydenotto lähetetty');
  }

  contactExaminer(examinerName: string) {
    this.elements
      .examinerRow(examinerName)
      .findByRole('button', { name: /Ota yhteyttä/i })
      .click();
  }
}

export const onPublicGoodAndSatisfactoryLevelPage =
  new PublicGoodAndSatisfactoryLevelPage();
