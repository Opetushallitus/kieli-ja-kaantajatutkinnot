import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicRegistrationPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
    win.localStorage.setItem('clerkEnabled', 'true');
  });
  cy.visit(AppRoutes.Registration);
});

Cypress.Commands.add('openEvaluationOrderPage', (id: number) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
    win.localStorage.setItem('clerkEnabled', 'true');
  });
  cy.visit(AppRoutes.ReassessmentOrder.replace(/:evaluationId/, `${id}`));
});

Cypress.Commands.add('isOnPage', (page: string) => {
  cy.url().should('include', page);
});

Cypress.Commands.add('openExamSessionRegistrationForm', (id: number) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
    win.localStorage.setItem('clerkEnabled', 'true');
  });
  cy.visit(
    AppRoutes.ExamSessionRegistration.replace(/:examSessionId/, `${id}`),
  );
});

Cypress.Commands.add('openPublicUserDetailsPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
    win.localStorage.setItem('clerkEnabled', 'true');
  });
  cy.visit(AppRoutes.UserDetails);
});
