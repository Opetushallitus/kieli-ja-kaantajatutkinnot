import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';

const row = (id: number) => `clerk-exam-events__id-${id}-row`;

class ClerkHomePage {
  elements = {
    examEventRow: (id: number) => cy.findByTestId(row(id)),
    languageFilter: () => cy.findByTestId('exam-events__language-filter'),
    pagination: () => cy.get('.table__head-box__pagination'),
    toggleFilter: (toggleFilter: ExamEventToggleFilter) =>
      cy.findByTestId(`clerk-exam-event-toggle-filters__${toggleFilter}-btn`),
    unusedSeatsNotification: () =>
      cy.findByTestId('clerk-homepage__notification___seats-available'),
    sessionExpiredModal: () =>
      cy.findByTestId('session-expired-modal'),
  };

  clickExamEventRow(id: number) {
    this.elements.examEventRow(id).should('be.visible').click();
  }

  clickCreateExamEvent() {
    cy.findByTestId('clerk-exam-events__create-exam-event-btn').click();
  }

  clickToggleFilter(toggleFilter: ExamEventToggleFilter) {
    this.elements.toggleFilter(toggleFilter).should('be.visible').click();
  }

  filterByLanguage(language: ExamLanguage) {
    this.elements
      .languageFilter()
      .should('be.visible')
      .get('[type="radio"]')
      .check(language);
  }

  expectFilteredExamEventsCount(count: number) {
    this.elements
      .pagination()
      .should('contain.text', `1 - ${count} / ${count}`);
  }

  expectUnusedSeatsNotification() {
    this.elements.unusedSeatsNotification().should('be.visible');
  }

  expectSessionExpiredModal() {
    this.elements.sessionExpiredModal().should('be.visible');
  }
}

export const onClerkHomePage = new ClerkHomePage();
