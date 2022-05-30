import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicHomePage', () => {
  cy.visit(AppRoutes.PublicHomePage);
});

Cypress.Commands.add('openClerkHomePage', () => {
  cy.visit(AppRoutes.ClerkHomePage);
});

Cypress.Commands.add('usePhoneViewport', () => {
  cy.viewport('iphone-6');
});

Cypress.Commands.add('goBack', () => {
  cy.go(-1);
});

Cypress.Commands.add('goForward', () => {
  cy.go(1);
});

Cypress.Commands.add('isOnPage', (page: AppRoutes) => {
  cy.url().should('include', page);
});
