import { AppRoutes } from 'enums/app';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';

describe('PublicHomePage', () => {
  beforeEach(() => {
    cy.openPublicHomePage();
  });

  it('should link to excellent level exams', () => {
    onPublicHomePage.continueToExcellentLevelExams();
    cy.url().should('include', AppRoutes.PublicExcellentLevelLanding);
  });

  it('should link to good and satisfactory level exams', () => {
    onPublicHomePage.continueToGoodAndSatisfactoryLevelExams();
    cy.url().should('include', AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
  });
});
