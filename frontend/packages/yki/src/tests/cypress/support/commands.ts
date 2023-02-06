import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicRegistrationPage', () => {
  cy.visit(AppRoutes.Registration);
});
