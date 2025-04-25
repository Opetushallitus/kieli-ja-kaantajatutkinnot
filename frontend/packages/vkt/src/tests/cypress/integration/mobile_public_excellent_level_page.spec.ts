import { ExamLanguage } from 'enums/app';
import { onPublicExcellentLevelPage } from 'tests/cypress/support/page-objects/publicExcellentLevelPage';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

describe('PublicExcellentLevelPage (mobile)', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.openPublicExcellentLevelPage();
  });

  it('should allow filtering exam events based on exam language', () => {
    onPublicExcellentLevelPage.expectFilteredExamEventsCount(
      publicExamEvents11.length,
    );

    onPublicExcellentLevelPage.filterByLanguage(ExamLanguage.FI);
    onPublicExcellentLevelPage.expectFilteredExamEventsCount(6);

    onPublicExcellentLevelPage.filterByLanguage(ExamLanguage.SV);
    onPublicExcellentLevelPage.expectFilteredExamEventsCount(5);

    onPublicExcellentLevelPage.filterByLanguage(ExamLanguage.ALL);
    onPublicExcellentLevelPage.expectFilteredExamEventsCount(
      publicExamEvents11.length,
    );
  });

  it('should display enroll button correctly based on enrollment status', () => {
    onPublicExcellentLevelPage.expectEnrollButtonDisabled(1);
    onPublicExcellentLevelPage.expectEnrollButtonText(
      1,
      'Ilmoittaudu myöhemmin',
    );
    onPublicExcellentLevelPage.expectEnrollButtonEnabled(2);
    onPublicExcellentLevelPage.expectEnrollButtonText(2, 'Ilmoittaudu');
    onPublicExcellentLevelPage.expectEnrollButtonEnabled(5);
    onPublicExcellentLevelPage.expectEnrollButtonText(5, 'Ilmoittaudu jonoon');
  });
});
