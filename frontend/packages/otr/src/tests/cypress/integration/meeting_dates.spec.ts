import { MeetingDateStatus } from 'enums/meetingDate';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onMeetingDatesPage } from 'tests/cypress/support/page-objects/meetingDatesPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { meetingDate } from 'tests/msw/fixtures/meetingDate';

describe('MeetingDatesPage', () => {
  beforeEach(() => {
    cy.openMeetingDatesPage();
  });

  it('should display correct number of meeting dates in header', () => {
    onMeetingDatesPage.expectTotalMeetingDatesCount(10);
  });

  it('should filter meeting dates by status', () => {
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

  it('should let user to add a new, unique meeting date', () => {
    onMeetingDatesPage.setDateForNewMeetingDate(meetingDate.date);
    onMeetingDatesPage.clickAddButton();

    onToast.expectText('Kokouspäivän 4.10.2030 lisäys onnistui');
  });

  it('should not allow adding duplicate meeting dates', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('2022-01-01');
    onMeetingDatesPage.expectAddButtonDisabled();
  });

  it('should show an error toast when trying to add a meeting date fails', () => {
    onMeetingDatesPage.setDateForNewMeetingDate('2030-01-01');
    onMeetingDatesPage.clickAddButton();

    onToast.expectText('Toiminto epäonnistui, yritä myöhemmin uudelleen');
  });

  it('should open a confirmation dialog when row delete icon is clicked, and delete the selected meeting date if user confirms', () => {
    onMeetingDatesPage.filterByStatus(MeetingDateStatus.Passed);
    onMeetingDatesPage.clickDeleteRowIcon(1);
    onDialog.clickButtonByText('Kyllä');

    onToast.expectText('Kokouspäivä 1.1.2022 poistettu');
  });

  it('should show an error toast if meeting date is chosen to be deleted, but an API error occurs', () => {
    onMeetingDatesPage.clickDeleteRowIcon(0);
    onDialog.clickButtonByText('Kyllä');

    onToast.expectText('Toiminto epäonnistui, yritä myöhemmin uudelleen');
  });
});
