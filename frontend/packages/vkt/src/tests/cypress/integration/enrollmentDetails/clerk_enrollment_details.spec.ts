import { EnrollmentStatus } from 'enums/app';
import { onClerkEnrollmentOverviewPage } from 'tests/cypress/support/page-objects/clerkEnrollmentOverviewPage';
import { onClerkExamEventOverviewPage } from 'tests/cypress/support/page-objects/clerkExamEventOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';

describe('ClerkEnrollmentOverview:ClerkEnrollmentDetails', () => {
  beforeEach(() => {
    onClerkExamEventOverviewPage.navigateById(clerkExamEvent.id);
  });

  it('should allow canceling enrollment', () => {
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 1'
    );
    onClerkExamEventOverviewPage.clickEnrollmentRow(1);
    onClerkEnrollmentOverviewPage.clickCancelEnrollmentButton();
    onDialog.expectText('Haluatko varmasti peruuttaa ilmoittautumisen?');
    onDialog.clickButtonByText('Kyllä');
    onToast.expectText('Ilmoittautuminen peruutettiin');
    onClerkEnrollmentOverviewPage.expectDisabledCancelEnrollmentButton();
    cy.go('back');

    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 2'
    );
  });

  it('should show disabled cancel enrollment button on already cancelled enrollment', () => {
    onClerkExamEventOverviewPage.clickEnrollmentRow(9);
    onClerkEnrollmentOverviewPage.expectDisabledCancelEnrollmentButton();
  });
});
