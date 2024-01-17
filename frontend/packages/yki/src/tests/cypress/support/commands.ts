import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicRegistrationPage', () => {
  cy.visit(AppRoutes.Registration);
});

Cypress.Commands.add('openEvaluationOrderPage', (id: number) => {
  cy.visit(AppRoutes.ReassessmentOrder.replace(/:evaluationId/, `${id}`));
});

Cypress.Commands.add('isOnPage', (page: string) => {
  cy.url().should('include', page);
});

Cypress.Commands.add('openExamSessionRegistrationForm', (id: number) => {
  cy.visit(
    AppRoutes.ExamSessionRegistration.replace(/:examSessionId/, `${id}`)
  );
});
