import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openClerkRegistrationPage', () => {
  cy.visit(AppRoutes.ClerkOrganizerRegister);
});

Cypress.Commands.add('openClerkAddOrganizerPage', () => {
  cy.visit(AppRoutes.ClerkAddOrganizer);
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
  cy.visit(AppRoutes.ClerkCustomerDetails.replace(/:personOid/, `${oid}`));
});

Cypress.Commands.add('openClerkCustomersSearchPage', () => {
  cy.visit(AppRoutes.CustomerSearch);
});

Cypress.Commands.add('openClerkExamDatesPage', () => {
  cy.visit(AppRoutes.ClerkExamDates);
});

Cypress.Commands.add('openClerkQuarantinePage', () => {
  cy.visit(AppRoutes.ClerkQuarantine);
});
