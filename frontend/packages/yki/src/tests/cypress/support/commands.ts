import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicRegistrationPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
  });
  cy.visit(AppRoutes.Registration);
});

Cypress.Commands.add('openEvaluationOrderPage', (id: number) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
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
  });
  cy.visit(
    AppRoutes.ExamSessionRegistration.replace(/:examSessionId/, `${id}`),
  );
});

Cypress.Commands.add('openPublicUserDetailsPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-yki', 'true');
  });
  cy.visit(AppRoutes.UserDetails);
});

Cypress.Commands.add('openClerkRegistrationPage', () => {
  cy.visit(AppRoutes.ClerkOrganizerRegister);
});

Cypress.Commands.add('openClerkFreeRegistrationPage', (cookies) => {
  if (cookies) {
    Object.keys(cookies).forEach((key) => {
      cy.setCookie(key, cookies[key]);
    });
  }
  cy.visit(AppRoutes.ClerkFreeRegistration);
});

Cypress.Commands.add(
  'openClerkFreeRegistrationDetailsPage',
  (id: number, cookies) => {
    if (cookies) {
      Object.keys(cookies).forEach((key) => {
        cy.setCookie(key, cookies[key]);
      });
    }
    cy.visit(AppRoutes.ClerkFreeRegistrationDetails.replace(/:id/, `${id}`));
  },
);

Cypress.Commands.add('openCustomerSearchPage', () => {
  cy.visit(AppRoutes.CustomerSearch);
});

Cypress.Commands.add('openClerkCustomerDetailsPage', (oid: string) => {
  cy.visit(AppRoutes.ClerkCustomerDetails.replace(/:oid/, `${oid}`));
});

Cypress.Commands.add('openClerkCustomersSearchPage', () => {
  cy.visit(AppRoutes.CustomerSearch);
});
