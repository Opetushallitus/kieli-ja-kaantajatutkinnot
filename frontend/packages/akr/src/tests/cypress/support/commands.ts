import { AppRoutes } from 'enums/app';

Cypress.Commands.add('openPublicHomePage', (shouldShowCookieBanner = false) => {
  cy.visit(AppRoutes.PublicHomePage, {
    onBeforeLoad: (window) => {
      if (!shouldShowCookieBanner) {
        window.sessionStorage.setItem('cookie-consent-akr', true);
      }
    },
  });
});

Cypress.Commands.add('openClerkHomePage', () => {
  cy.visit(AppRoutes.ClerkHomePage);
});

Cypress.Commands.add('openExaminationDatesPage', () => {
  cy.visit(AppRoutes.ExaminationDatesPage);
});

Cypress.Commands.add('openMeetingDatesPage', () => {
  cy.visit(AppRoutes.MeetingDatesPage);
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

Cypress.Commands.add('isOnPage', (page: string) => {
  cy.url().should('include', page);
});
