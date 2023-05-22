import { ExamLanguage } from 'enums/app';

const row = (id: number) => `public-exam-events__id-${id}-row`;

class PublicHomePage {
  elements = {
    enrollButton: () => cy.findByTestId('public-exam-events__enroll-btn'),
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
  };

  clickExamEventRow(id: number) {
    this.elements.examEventRow(id).should('be.visible').click();
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

  expectEnrollButtonDisabled() {
    this.elements.enrollButton().should('be.disabled');
  }

  expectEnrollButtonEnabled() {
    this.elements.enrollButton().should('be.enabled');
  }

  expectEnrollButtonToNotExist() {
    this.elements.enrollButton().should('not.exist');
  }

  expectEnrollButtonToExist() {
    this.elements.enrollButton().should('exist');
  }

  expectCheckboxChecked(id: number) {
    this.elements.examEventRowCheckbox(id).should('be.checked');
  }

  expectCheckboxNotChecked(id: number) {
    this.elements.examEventRowCheckbox(id).should('not.be.checked');
  }

  clickEnrollButton() {
    this.elements.enrollButton().should('be.visible').click();
  }

  expectReservationExpiredOkButtonEnabled() {
    this.elements.reservationExpiredOkButton().should('be.visible.enabled');
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
