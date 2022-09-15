import { ExamLanguage } from 'enums/app';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

describe('PublicHomePage', () => {
  beforeEach(() => {
    cy.openPublicHomePage();
  });

  it('should the filtered amount of exam events in table pagination', () => {
    onPublicHomePage.expectFilteredExamEventsCount(publicExamEvents11.length);

    onPublicHomePage.filterByLanguage(ExamLanguage.FI);
    onPublicHomePage.expectFilteredExamEventsCount(6);

    onPublicHomePage.filterByLanguage(ExamLanguage.SV);
    onPublicHomePage.expectFilteredExamEventsCount(5);

    onPublicHomePage.filterByLanguage(ExamLanguage.ALL);
    onPublicHomePage.expectFilteredExamEventsCount(publicExamEvents11.length);
  });

  it('should enable enroll button only if exam event without congestion is selected', () => {
    onPublicHomePage.expectEnrollButtonDisabled();

    onPublicHomePage.clickExamEventRow(2);
    onPublicHomePage.expectCheckboxChecked(2);
    onPublicHomePage.expectEnrollButtonEnabled();

    onPublicHomePage.clickExamEventRow(1);
    onPublicHomePage.expectCheckboxChecked(1);
    onPublicHomePage.expectCheckboxNotChecked(2);
    onPublicHomePage.expectEnrollButtonDisabled();
  });
});