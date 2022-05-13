import dayjs from 'dayjs';
import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints, APIError } from 'enums/api';
import { MeetingStatus } from 'enums/meetingDate';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onMeetingDatesPage } from 'tests/cypress/support/page-objects/meetingDatesPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';
import { useFixedDate } from 'tests/cypress/support/utils/date';

let meetingDates;
const fixedDateForTests = dayjs('2022-01-17T12:35:00+0200');
const meetingDateToAdd = {
  id: 11,
  version: 0,
  date: '2030-10-04',
};
const meetingDateToBeDeleted = 5;

beforeEach(() => {
  useFixedDate(fixedDateForTests);

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
    // Use fixed date in tests as the as the status filters depend on it
    onMeetingDatesPage.expectSelectedMeetingDatesCount(4);

    onMeetingDatesPage.filterByStatus(MeetingStatus.Passed);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(6);

    onMeetingDatesPage.filterByStatus(MeetingStatus.Upcoming);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(4);
  });

  it('should order upcoming meeting dates by ascending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingStatus.Upcoming);

    onMeetingDatesPage.expectRowToContain(0, '14.5.2022');
    onMeetingDatesPage.expectRowToContain(1, '25.9.2022');
  });

  it('should order passed meeting dates by descending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingStatus.Passed);

    onMeetingDatesPage.expectRowToContain(0, '1.1.2022');
    onMeetingDatesPage.expectRowToContain(1, '18.11.2021');
  });

  it('should let user to add a new, unique meeting date', () => {
    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onMeetingDatesPage.expectAddButtonDisabled();

    cy.intercept('GET', APIEndpoints.MeetingDate, [
      ...meetingDates,
      meetingDateToAdd,
    ]);
    onMeetingDatesPage.setDateForNewMeetingDate('2030-10-04');

    cy.intercept('POST', APIEndpoints.MeetingDate, meetingDateToAdd).as(
      'create'
    );
    onMeetingDatesPage.clickAddButton();
    cy.wait('@create');

    onMeetingDatesPage.expectTotalMeetingDatesCount(11);
  });

  it('should not add duplicate meeting dates', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('2022-01-01');
    onMeetingDatesPage.expectAddButtonDisabled();
  });

  it('should show a generic API error toast when trying to add a meeting date', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('2030-10-04');

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
    onMeetingDatesPage.clickDeleteRowIcon(1);

    onDialog.expectText('Haluatko varmasti poistaa kokouspäivän?');
    onDialog.clickButtonByText('Takaisin');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
  });

  it('should open a confirmation dialog when row delete icon is clicked, and delete the selected meeting date if user confirms', () => {
    const newMeetingDates = meetingDates.filter(
      (m) => m.id !== meetingDateToBeDeleted
    );

    cy.intercept('GET', APIEndpoints.MeetingDate, [...newMeetingDates]);
    onMeetingDatesPage.filterByStatus(MeetingStatus.Passed);
    onMeetingDatesPage.clickDeleteRowIcon(1);

    cy.intercept(
      'DELETE',
      `${APIEndpoints.MeetingDate}/${meetingDateToBeDeleted}`,
      {}
    ).as('delete');

    onDialog.clickButtonByText('Kyllä');
    cy.wait('@delete');

    onMeetingDatesPage.expectRowToContain(0, '1.1.2022');
    onMeetingDatesPage.expectRowToContain(1, '15.8.2021');
    onMeetingDatesPage.expectTotalMeetingDatesCount(9);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(5);
  });

  it('should show an error toast if meeting date is chosen to be deleted, but an API error occurs', () => {
    onMeetingDatesPage.filterByStatus(MeetingStatus.Passed);
    onMeetingDatesPage.clickDeleteRowIcon(1);

    cy.intercept(
      'DELETE',
      `${APIEndpoints.MeetingDate}/${meetingDateToBeDeleted}`,
      createAPIErrorResponse(APIError.MeetingDateDeleteHasAuthorisations)
    ).as('deleteWithError');

    onDialog.clickButtonByText('Kyllä');
    cy.wait('@deleteWithError');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onToast.expectText(
      'Kokouspäivän poisto epäonnistui, koska sille on kirjattu auktorisointeja'
    );
  });
});
