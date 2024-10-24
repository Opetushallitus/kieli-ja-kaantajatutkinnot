import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints, APIError } from 'enums/api';
import { MeetingDateStatus } from 'enums/meetingDate';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onMeetingDatesPage } from 'tests/cypress/support/page-objects/meetingDatesPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';

let meetingDates;
const meetingDateToAdd = {
  id: 11,
  version: 0,
  date: '2030-10-04',
};
const meetingDateToBeDeleted = { id: 5, dateLabel: '18.11.2021' };
beforeEach(() => {
  cy.fixture('meeting_dates_10.json').then((dates) => {
    meetingDates = dates;
    cy.intercept('GET', APIEndpoints.MeetingDate, meetingDates);
  });

  cy.openMeetingDatesPage();
});

describe('MeetingDatesPage', () => {
  it('should display correct number of meeting dates in header', () => {
    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
  });

  it('should filter meeting dates by status', () => {
    onMeetingDatesPage.expectSelectedMeetingDatesCount(4);

    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(6);

    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Upcoming);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(4);
  });

  it('should order upcoming meeting dates by ascending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Upcoming);

    onMeetingDatesPage.expectRowToContain(0, '14.05.2022');
    onMeetingDatesPage.expectRowToContain(1, '25.09.2022');
  });

  it('should order passed meeting dates by descending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);

    onMeetingDatesPage.expectRowToContain(0, '01.01.2022');
    onMeetingDatesPage.expectRowToContain(1, '18.11.2021');
  });

  it('should let user to add a new, unique meeting date', () => {
    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onMeetingDatesPage.expectAddButtonDisabled();

    cy.intercept('GET', APIEndpoints.MeetingDate, [
      ...meetingDates,
      meetingDateToAdd,
    ]);
    onMeetingDatesPage.setDateForNewMeetingDate('04.10.2030');

    cy.intercept('POST', APIEndpoints.MeetingDate, meetingDateToAdd).as(
      'create',
    );
    onMeetingDatesPage.clickAddButton();
    cy.wait('@create');

    onMeetingDatesPage.expectTotalMeetingDatesCount(11);
    onToast.expectText('Kokouspäivän 04.10.2030 lisäys onnistui');
  });

  it('should not add duplicate meeting dates', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('01.01.2022');
    onMeetingDatesPage.expectAddButtonDisabled();
  });

  it('should show a generic API error toast when trying to add a meeting date', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('04.10.2030');

    cy.intercept('POST', APIEndpoints.MeetingDate, {
      statusCode: HTTPStatusCode.InternalServerError,
      body: {},
    }).as('createWithError');
    onMeetingDatesPage.clickAddButton();
    cy.wait('@createWithError');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onToast.expectText('Toiminto epäonnistui, yritä myöhemmin uudelleen');
  });

  it('should open a confirmation dialog when row delete icon is clicked, and do no changes if user backs out', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.deleteMeetingDate(meetingDateToBeDeleted.dateLabel);

    onDialog.expectText('Haluatko varmasti poistaa kokouspäivän?');
    onDialog.clickButtonByText('Takaisin');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
  });

  it('should open a confirmation dialog when row delete icon is clicked, and delete the selected meeting date if user confirms', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.deleteMeetingDate(meetingDateToBeDeleted.dateLabel);

    cy.intercept(
      'DELETE',
      `${APIEndpoints.MeetingDate}/${meetingDateToBeDeleted.id}`,
      {},
    ).as('delete');
    const newMeetingDates = meetingDates.filter(
      (m) => m.id !== meetingDateToBeDeleted.id,
    );
    cy.intercept('GET', APIEndpoints.MeetingDate, [...newMeetingDates]);

    onDialog.clickButtonByText('Kyllä');

    onMeetingDatesPage.expectRowToContain(0, '01.01.2022');
    onMeetingDatesPage.expectRowToContain(1, '15.08.2021');
    onMeetingDatesPage.expectTotalMeetingDatesCount(9);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(5);

    onToast.expectText(
      `Kokouspäivä ${meetingDateToBeDeleted.dateLabel} poistettu`,
    );
  });

  it('should show an error toast if meeting date is chosen to be deleted, but an API error occurs', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.deleteMeetingDate(meetingDateToBeDeleted.dateLabel);

    cy.intercept(
      'DELETE',
      `${APIEndpoints.MeetingDate}/${meetingDateToBeDeleted.id}`,
      createAPIErrorResponse(APIError.MeetingDateDeleteHasAuthorisations),
    ).as('deleteWithError');
    onDialog.clickButtonByText('Kyllä');
    cy.wait('@deleteWithError');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onToast.expectText(
      'Kokouspäivän poisto epäonnistui, koska sille on kirjattu auktorisointeja',
    );
  });
});
