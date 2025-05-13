import { AppRoutes } from 'enums/app';
import { ClerkUser } from 'interfaces/clerkUser';

// This definition should be kept in sync with the one found in tests/msw/handlers.ts.
// As long as the definition is only used in the handler and in Cypress tests,
// we must *manually* keep the definitions in sync to avoid having to export the definition.
// Otherwise, we'll get an error regarding unused export (as files under src/tests/cypress are excluded from linting as per packages/vkt/tsconfig.json).
const examinerUser: ClerkUser = {
  oid: '1.2.246.562.10.30000000003',
  isAdmin: false,
  isExaminer: true,
};

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
