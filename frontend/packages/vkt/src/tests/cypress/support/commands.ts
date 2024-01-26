import { AppRoutes } from 'enums/app';
import { RouteUtils } from 'utils/routes';

Cypress.Commands.add('openPublicHomePage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
  });
  cy.visit(AppRoutes.PublicHomePage);
});

Cypress.Commands.add(
  'openPublicEnrollmentPage',
  (examEventId: number, persistedState = '{}') => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('persist:root', persistedState);
      cy.setCookie('cookie-consent-vkt', 'true');
    });
    cy.visit(
      RouteUtils.replaceExamEventId(
        AppRoutes.PublicEnrollmentContactDetails,
        examEventId,
      ),
    );
  },
);

Cypress.Commands.add('openClerkHomePage', () => {
  cy.window().then((win) => win.sessionStorage.setItem('persist:root', '{}'));
  cy.visit(AppRoutes.ClerkHomePage);
});

Cypress.Commands.add('openClerkExamEventPage', (examEventId: number) => {
  cy.window().then((win) => win.sessionStorage.setItem('persist:root', '{}'));
  cy.visit(
    RouteUtils.replaceExamEventId(
      AppRoutes.ClerkExamEventOverviewPage,
      examEventId,
    ),
  );
});

Cypress.Commands.add('openClerkCreateExamEventPage', () => {
  cy.window().then((win) => win.sessionStorage.setItem('persist:root', '{}'));
  cy.visit(AppRoutes.ClerkExamEventCreatePage);
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
