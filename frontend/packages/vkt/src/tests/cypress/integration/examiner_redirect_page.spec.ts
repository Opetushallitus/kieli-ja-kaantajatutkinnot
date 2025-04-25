import { AppRoutes } from 'enums/app';
import { examinerUser } from 'tests/msw/handlers';

describe('ExaminerRedirectPage', () => {
  it('should redirect examiner to URL matching their own details', () => {
    cy.openExaminerPage();
    cy.url().should('satisfy', (url) =>
      url.endsWith(
        AppRoutes.ExaminerHomePage.replace(/:oid/, examinerUser.oid),
      ),
    );
  });
});
