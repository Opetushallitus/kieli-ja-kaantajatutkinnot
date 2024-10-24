import { MeetingDateStatus } from 'enums/meetingDate';

class MeetingDatesPage {
  elements = {
    heading: () => cy.findByTestId('meeting-dates-page__heading'),
    statusButton: (status: MeetingDateStatus) =>
      cy.findByTestId(`meeting-dates-filters__btn--${status}`),
    datePicker: () => cy.get('.custom-date-picker'),
    addButton: () => cy.findByTestId('meeting-dates-page__add-btn'),
    tableRow: (i: number) =>
      cy.get('.meeting-dates__listing > tbody > tr').eq(i),
    meetingDateRow: (date: string) =>
      cy
        .get('.meeting-dates__listing > tbody > tr')
        .contains(date)
        .first()
        .parentsUntil('tr'),
  };

  expectTotalMeetingDatesCount(count: number) {
    this.elements.heading().should('contain.text', `Kokouspäivät(${count})`);
  }

  expectSelectedMeetingDatesCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByStatus(status: MeetingDateStatus) {
    this.elements.statusButton(status).should('be.visible').click();
  }

  expectRowToContain(i: number, text: string) {
    this.elements.tableRow(i).should('contain.text', text);
  }

  setDateForNewMeetingDate(date: string) {
    this.elements.datePicker().should('be.visible').type(date);
  }

  expectAddButtonDisabled() {
    this.elements.addButton().should('be.disabled');
  }

  clickAddButton() {
    this.elements.addButton().should('be.visible').click();
  }

  deleteMeetingDate(date: string) {
    this.elements
      .meetingDateRow(date)
      .siblings()
      .find('button')
      .should('be.visible')
      .click();
  }
}

export const onMeetingDatesPage = new MeetingDatesPage();
