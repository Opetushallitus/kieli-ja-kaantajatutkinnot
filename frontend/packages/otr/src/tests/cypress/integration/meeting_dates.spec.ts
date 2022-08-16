import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints, APIError } from 'enums/api';
import { MeetingDateStatus } from 'enums/meetingDate';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onMeetingDatesPage } from 'tests/cypress/support/page-objects/meetingDatesPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';

const meetingDateToBeDeleted = 6;

describe('MeetingDatesPage', () => {
  beforeEach(() => {
    cy.openMeetingDatesPage();
  });

  it('should display correct number of meeting dates in header', () => {
    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
  });

  it('should filter meeting dates by status', () => {
    // Use fixed date in tests as the status filters depend on it
    onMeetingDatesPage.expectSelectedMeetingDatesCount(3);

    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(7);

    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Upcoming);
    onMeetingDatesPage.expectSelectedMeetingDatesCount(3);
  });

  it('should order upcoming meeting dates by ascending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Upcoming);

    onMeetingDatesPage.expectRowToContain(0, '25.9.2022');
    onMeetingDatesPage.expectRowToContain(1, '3.12.2022');
  });

  it('should order passed meeting dates by descending date', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);

    onMeetingDatesPage.expectRowToContain(0, '14.5.2022');
    onMeetingDatesPage.expectRowToContain(1, '1.1.2022');
  });

  it('should not allow adding duplicate meeting dates', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('2022-01-01');
    onMeetingDatesPage.expectAddButtonDisabled();
  });

  it('should show a generic API error toast when trying to add a meeting date fails', () => {
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

  it('should show an error toast if meeting date is chosen to be deleted, but an API error occurs', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.clickDeleteRowIcon(1);

    cy.intercept(
      'DELETE',
      `${APIEndpoints.MeetingDate}/${meetingDateToBeDeleted}`,
      createAPIErrorResponse(APIError.MeetingDateDeleteHasQualifications)
    ).as('deleteWithError');

    onDialog.clickButtonByText('Kyllä');
    cy.wait('@deleteWithError');

    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
    onToast.expectText(
      'Kokouspäivän poisto epäonnistui, koska sille on kirjattu rekisteröintejä'
    );
  });
});
