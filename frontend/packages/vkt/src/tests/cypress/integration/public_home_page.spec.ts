import { ExamLanguage } from 'enums/app';
import { onCookieBanner } from 'tests/cypress/support/page-objects/cookieBanner';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

describe('PublicHomePage', () => {
  beforeEach(() => {
    cy.openPublicHomePage();
  });

  it('should close cookie banner', () => {
    onCookieBanner.closeBanner();

    onCookieBanner.getBanner().should('not.exist');
  });

  it('should allow filtering exam events based on exam language', () => {
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
