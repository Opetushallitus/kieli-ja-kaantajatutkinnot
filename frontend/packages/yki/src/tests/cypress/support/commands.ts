import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicHomePage', () => {
  cy.visit(AppRoutes.PublicHomePage);
});
