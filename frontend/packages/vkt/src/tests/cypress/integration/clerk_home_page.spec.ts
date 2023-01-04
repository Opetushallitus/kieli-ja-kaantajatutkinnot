import { AppRoutes, ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';

const examEventCounts = {
  [ExamEventToggleFilter.Upcoming]: 6,
  [ExamEventToggleFilter.Passed]: 3,
};

describe('ClerkHomePage', () => {
  beforeEach(() => {
    cy.openClerkHomePage();
  });

  it('should split listed exam events under upcoming and passed tabs', () => {
    onClerkHomePage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming]
    );

    onClerkHomePage.clickToggleFilter(ExamEventToggleFilter.Passed);
    onClerkHomePage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Passed]
    );

    onClerkHomePage.clickToggleFilter(ExamEventToggleFilter.Upcoming);
    onClerkHomePage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming]
    );
  });

  it('should allow filtering exam events by language', () => {
    onClerkHomePage.filterByLanguage(ExamLanguage.FI);
    onClerkHomePage.expectFilteredExamEventsCount(4);

    onClerkHomePage.filterByLanguage(ExamLanguage.SV);
    onClerkHomePage.expectFilteredExamEventsCount(2);

    onClerkHomePage.filterByLanguage(ExamLanguage.ALL);
    onClerkHomePage.expectFilteredExamEventsCount(
      examEventCounts[ExamEventToggleFilter.Upcoming]
    );
  });

  it('should allow navigating to exam event page by clicking related row', () => {
    onClerkHomePage.clickExamEventRow(1);
    cy.isOnPage(
      AppRoutes.ClerkExamEventOverviewPage.replace(/:examEventId$/, '1')
    );
  });

  it('should allow navigating to create exam event by clicking create button', () => {
    onClerkHomePage.clickCreateExamEvent();
    cy.isOnPage(AppRoutes.ClerkExamEventCreatePage);
  });
});
