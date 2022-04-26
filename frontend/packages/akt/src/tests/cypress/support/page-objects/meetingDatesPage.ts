import { MeetingStatus } from 'enums/meetingDate';

class MeetingDatesPage {
  elements = {
    heading: () => cy.findByTestId('meeting-dates-page__heading'),
    statusButton: (status: MeetingStatus) =>
      cy.findByTestId(`meeting-dates-filters__btn--${status}`),
    datePicker: () => cy.get('input[type=date]'),
    addButton: () => cy.findByTestId('meeting-dates-page__add-btn'),
    tableRow: (i: number) =>
      cy.get('.meeting-dates__listing > tbody > tr').eq(i),
  };

  expectTotalMeetingDatesCount(count: number) {
    this.elements.heading().should('contain.text', `Kokouspäivät(${count})`);
  }

  expectSelectedMeetingDatesCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  filterByStatus(status: MeetingStatus) {
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

  clickDeleteRowIcon(i: number) {
    this.elements.tableRow(i).find('button').should('be.visible').click();
  }
}

export const onMeetingDatesPage = new MeetingDatesPage();
