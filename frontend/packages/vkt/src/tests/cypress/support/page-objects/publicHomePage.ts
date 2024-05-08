import { ExamLanguage } from 'enums/app';

const row = (id: number) => `public-exam-events__id-${id}-row`;

class PublicHomePage {
  elements = {
    enrollButton: (examEventId: number) =>
      cy.findByTestId(`public-exam-events-${examEventId}__enroll-btn`),
    examEventRow: (id: number) => cy.findByTestId(row(id)),
    examEventRowCheckbox: (id: number) =>
      cy.findByTestId(row(id)).find('input[type=checkbox]'),
    languageFilter: () => cy.findByTestId('exam-events__language-filter'),
    pagination: () => cy.get('.table__head-box__pagination'),
    reservationTimerText: () =>
      cy.findByTestId('public-enrollment__reservation-timer-text'),
    reservationRenewButton: () =>
      cy.findByTestId('public-enrollment__renew-reservation-modal-button'),
    reservationExpiredOkButton: () =>
      cy.findByTestId('public-enrollment__reservation-expired-ok-button'),
    enrollAuthenticateButton: () =>
      cy.findByTestId('public-enrollment__authenticate-button'),
    sessionExpiredModal: () =>
      cy.findByTestId('session-expired-modal'),
  };

  clickExamEventRow(id: number) {
    this.elements.examEventRow(id).should('be.visible').click();
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

  expectEnrollButtonText(examEventId: number, text: string) {
    this.elements.enrollButton(examEventId).should('have.text', text);
  }

  expectEnrollButtonDisabled(examEventId: number) {
    this.elements.enrollButton(examEventId).should('be.disabled');
  }

  expectEnrollButtonEnabled(examEventId: number) {
    this.elements.enrollButton(examEventId).should('be.enabled');
  }

  expectCheckboxChecked(id: number) {
    this.elements.examEventRowCheckbox(id).should('be.checked');
  }

  expectCheckboxNotChecked(id: number) {
    this.elements.examEventRowCheckbox(id).should('not.be.checked');
  }

  clickEnrollButton(examEventId) {
    this.elements.enrollButton(examEventId).should('be.visible').click();
  }

  expectReservationExpiredOkButtonEnabled() {
    this.elements.reservationExpiredOkButton().should('be.visible.enabled');
  }

  expectSessionExpiredModal() {
    this.elements.sessionExpiredModal().should('be.visible');
  }

  clickEnrollAuthenticateButton() {
    this.elements.enrollAuthenticateButton().should('be.visible').click();
  }

  clickReservationRenewButton() {
    this.elements.reservationRenewButton().should('be.visible').click();
  }

  expectReservationTimeLeft(minutes: string, seconds: string) {
    this.elements
      .reservationTimerText()
      .should('be.visible')
      .should('contain.text', `${minutes}:${seconds}`);
  }
}

export const onPublicHomePage = new PublicHomePage();
