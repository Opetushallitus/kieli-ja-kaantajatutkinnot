import { AppRoutes } from 'enums/app';

// localStorage clerkEnabled works in dev, __CLERK_ENABLED__ works in prod.
// Object.defineProperty prevents the inline <script> in the served HTML from
// overwriting __CLERK_ENABLED__ after onBeforeLoad runs.

const visitWithNewYkiUi = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      Object.defineProperty(win, '__CLERK_ENABLED__', {
        get: () => true,
        set: () => {},
        configurable: true,
      });
      win.localStorage.setItem('clerkEnabled', 'true');
    },
  });
};

Cypress.Commands.add('openPublicRegistrationPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
  });
  visitWithNewYkiUi(AppRoutes.Registration);
});

Cypress.Commands.add('openEvaluationOrderPage', (id: number) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
  });
  visitWithNewYkiUi(
    AppRoutes.ReassessmentOrder.replace(/:evaluationId/, `${id}`),
  );
});

Cypress.Commands.add('isOnPage', (page: string) => {
  cy.url().should('include', page);
});

Cypress.Commands.add(
  'openExamSessionRegistrationForm',
  (id: number, registrationId: number) => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('persist:root', '{}');
      cy.setCookie('cookie-consent-yki', 'true');
    });
    visitWithNewYkiUi(
      AppRoutes.ExamSessionRegistration.replace(
        /:examSessionId/,
        `${id}`,
      ).replace(/:registrationId/, `${registrationId}`),
    );
  },
);

Cypress.Commands.add('openPublicUserDetailsPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
  });
  visitWithNewYkiUi(AppRoutes.UserDetails);
});
