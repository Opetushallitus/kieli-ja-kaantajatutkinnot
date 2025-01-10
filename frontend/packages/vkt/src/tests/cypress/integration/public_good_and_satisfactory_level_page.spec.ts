import { AppRoutes, ExamLanguage } from 'enums/app';
import { onCookieBanner } from 'tests/cypress/support/page-objects/cookieBanner';
import { onPublicGoodAndSatisfactoryLevelPage } from 'tests/cypress/support/page-objects/publicGoodAndSatisfactoryLevelPage';
import { publicExaminers } from 'tests/msw/fixtures/publicExaminer';

describe('PublicGoodAndSatisfactoryLevelPage', () => {
  beforeEach(() => {
    cy.openPublicGoodAndSatisfactoryLevelPage();
    onCookieBanner.closeBanner();
  });

  it('should allow filtering examiners by exam language', () => {
    onPublicGoodAndSatisfactoryLevelPage.filterExaminersByExamLanguage(
      ExamLanguage.FI,
    );
    onPublicGoodAndSatisfactoryLevelPage.expectFilteredExaminersCount(2);

    onPublicGoodAndSatisfactoryLevelPage.filterExaminersByExamLanguage(
      ExamLanguage.SV,
    );
    onPublicGoodAndSatisfactoryLevelPage.expectFilteredExaminersCount(3);

    onPublicGoodAndSatisfactoryLevelPage.filterExaminersByExamLanguage(
      ExamLanguage.ALL,
    );
    onPublicGoodAndSatisfactoryLevelPage.expectFilteredExaminersCount(4);
  });

  it('should redirect user to contact request form when clicking on examiner', () => {
    const lastName = 'Alanen';
    const firstName = 'Anneli';
    const examiner = publicExaminers.filter(
      (v) => v.lastName === lastName && v.firstName === firstName,
    )[0];
    onPublicGoodAndSatisfactoryLevelPage.contactExaminer(
      `${firstName} ${lastName}`,
    );
    cy.url().should(
      'include',
      AppRoutes.PublicEnrollmentContactContactDetails.replace(
        /:examinerId/,
        `${examiner.id}`,
      ),
    );
  });
});
