import { EnrollmentStatus } from 'enums/app';
import { onClerkExamEventOverviewPage } from 'tests/cypress/support/page-objects/clerkExamEventOverviewPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';

describe('ClerkExamEventOverview:ClerkExamEventDetails', () => {
  beforeEach(() => {
    onClerkExamEventOverviewPage.navigateById(clerkExamEvent.id);
  });

  it('should display correct on enrollment status update buttons', () => {
    onClerkExamEventOverviewPage.expectEnrollmentStatusUpdateButtonToHaveText(
      8,
      'Siirrä tutkintoon'
    );
    onClerkExamEventOverviewPage.expectEnrollmentStatusUpdateButtonToHaveText(
      7,
      'Siirrä takaisin jonoon'
    );
  });

  it('should update enrollment status when update status button is clicked', () => {
    // Verify initial state
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.PAID,
      'Ilmoittautuneet: 6'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.EXPECTING_PAYMENT,
      'Jonosta siirretyt / maksu puuttuu: 1'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.QUEUED,
      'Jonoon ilmoittautuneet: 1'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 1'
    );

    // Click status update button
    onClerkExamEventOverviewPage.clickChangeEnrollmentStatusButton(7);
    onToast.expectText('Siirto onnistui');

    // Verify outcome state
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.PAID,
      'Ilmoittautuneet: 6'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.QUEUED,
      'Jonoon ilmoittautuneet: 2'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 1'
    );
  });
});
