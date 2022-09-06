import { ExaminationDateStatus } from 'enums/examinationDate';

class ExaminationDatesPage {
  elements = {
    heading: () => cy.findByTestId('examination-dates-page__heading'),
    statusButton: (status: ExaminationDateStatus) =>
      cy.findByTestId(`examination-dates-filters__btn--${status}`),
    datePicker: () => cy.get('.custom-date-picker'),
    addButton: () => cy.findByTestId('examination-dates-page__add-btn'),
    tableRow: (i: number) =>
      cy.get('.examination-dates__listing > tbody > tr').eq(i),
  };

  expectTotalExaminationDatesCount(count: number) {
    this.elements.heading().should('contain.text', `Tutkintopäivät(${count})`);
  }

  expectSelectedExaminationDatesCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByStatus(status: ExaminationDateStatus) {
    this.elements.statusButton(status).should('be.visible').click();
  }

  expectRowToContain(i: number, text: string) {
    this.elements.tableRow(i).should('contain.text', text);
  }

  setDateForNewExaminationDate(date: string) {
    this.elements.datePicker().should('be.visible').type(date);
  }

  expectAddButtonDisabled() {
    this.elements.addButton().should('be.disabled');
  }

  clickAddButton() {
    this.elements.addButton().should('be.visible').click();
  }

  clickDeleteRowIcon(i: number) {
    this.elements.tableRow(i).find('button').should('be.visible').click();
  }
}

export const onExaminationDatesPage = new ExaminationDatesPage();
