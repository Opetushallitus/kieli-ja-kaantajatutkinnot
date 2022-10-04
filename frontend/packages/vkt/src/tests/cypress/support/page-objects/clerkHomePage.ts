import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';

const row = (id: number) => `clerk-exam-events__id-${id}-row`;

class ClerkHomePage {
  elements = {
    examEventRow: (id: number) => cy.findByTestId(row(id)),
    languageFilter: () => cy.findByTestId('exam-events__language-filter'),
    pagination: () => cy.get('.table__head-box__pagination'),
    toggleFilter: (toggleFilter: ExamEventToggleFilter) =>
      cy.findByTestId(`clerk-exam-event-toggle-filters__${toggleFilter}-btn`),
  };

  clickExamEventRow(id: number) {
    this.elements.examEventRow(id).should('be.visible').click();
  }

  clickToggleFilter(toggleFilter: ExamEventToggleFilter) {
    this.elements.toggleFilter(toggleFilter).should('be.visible').click();
  }

  filterByLanguage(language: ExamLanguage) {
    let value;
    switch (language) {
      case ExamLanguage.FI:
        value = 'Näytä vain suomi';
        break;

      case ExamLanguage.SV:
        value = 'Näytä vain ruotsi';
        break;

      default:
        value = 'Näytä kaikki kielet';
    }

    this.elements.languageFilter().should('be.visible').type(`${value}{enter}`);
  }

  expectFilteredExamEventsCount(count: number) {
    this.elements
      .pagination()
      .should('contain.text', `1 - ${count} / ${count}`);
  }
}

export const onClerkHomePage = new ClerkHomePage();
