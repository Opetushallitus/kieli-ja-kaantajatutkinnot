import { ExamLanguage } from 'enums/app';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

describe('PublicHomePage (mobile)', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.openPublicHomePage();
  });

  it('should show the filtered amount of exam events in table pagination', () => {
    onPublicHomePage.expectFilteredExamEventsCount(publicExamEvents11.length);

    onPublicHomePage.filterByLanguage(ExamLanguage.FI);
    onPublicHomePage.expectFilteredExamEventsCount(6);

    onPublicHomePage.filterByLanguage(ExamLanguage.SV);
    onPublicHomePage.expectFilteredExamEventsCount(5);

    onPublicHomePage.filterByLanguage(ExamLanguage.ALL);
    onPublicHomePage.expectFilteredExamEventsCount(publicExamEvents11.length);
  });

  it('should display enroll button correctly based on enrollment status', () => {
    onPublicHomePage.expectEnrollButtonDisabled(1);
    onPublicHomePage.expectEnrollButtonText(1, 'Ilmoittaudu myöhemmin');
    onPublicHomePage.expectEnrollButtonEnabled(2);
    onPublicHomePage.expectEnrollButtonText(2, 'Ilmoittaudu');
    onPublicHomePage.expectEnrollButtonEnabled(5);
    onPublicHomePage.expectEnrollButtonText(5, 'Ilmoittaudu jonoon');
  });
});
