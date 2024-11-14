import { AppRoutes, ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { onClerkExcellentLevelPage } from 'tests/cypress/support/page-objects/clerkExcellentLevelPage';

const examEventCounts = {
  [ExamEventToggleFilter.Upcoming]: 6,
  [ExamEventToggleFilter.Passed]: 3,
};

describe('ClerkExcellentLevelPage', () => {
  beforeEach(() => {
    cy.openClerkExcellentLevelPage();
  });

  it('should split listed exam events under upcoming and passed tabs', () => {
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming],
    );

    onClerkExcellentLevelPage.clickToggleFilter(ExamEventToggleFilter.Passed);
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Passed],
    );

    onClerkExcellentLevelPage.clickToggleFilter(ExamEventToggleFilter.Upcoming);
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming],
    );

    onClerkExcellentLevelPage.expectUnusedSeatsNotification();
  });

  it('should allow filtering exam events by language', () => {
    onClerkExcellentLevelPage.filterByLanguage(ExamLanguage.FI);
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(4);

    onClerkExcellentLevelPage.filterByLanguage(ExamLanguage.SV);
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(2);

    onClerkExcellentLevelPage.filterByLanguage(ExamLanguage.ALL);
    onClerkExcellentLevelPage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming],
    );
  });

  it('should allow navigating to exam event page by clicking related row', () => {
    onClerkExcellentLevelPage.clickExamEventRow(1);
    cy.isOnPage(
      AppRoutes.ClerkExamEventOverviewPage.replace(/:examEventId$/, '1'),
    );
  });

  it('should allow navigating to create exam event by clicking create button', () => {
    onClerkExcellentLevelPage.clickCreateExamEvent();
    cy.isOnPage(AppRoutes.ClerkExamEventCreatePage);
  });

  it('should show session expired modal', () => {
    // Only used in mockup server to trigger
    // logged out response
    cy.setCookie('noAuth', 'true');
    cy.wait(10);
    cy.tick(6 * 1000);
    onClerkExcellentLevelPage.expectSessionExpiredModal();
  });
});
