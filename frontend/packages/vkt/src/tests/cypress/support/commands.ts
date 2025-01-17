import { AppRoutes } from 'enums/app';
import { RouteUtils } from 'utils/routes';

Cypress.Commands.add('openPublicHomePage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-vkt', 'true');
  });
  cy.visit(AppRoutes.PublicHomePage);
});

Cypress.Commands.add('openPublicExcellentLevelPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
  });
  cy.visit(AppRoutes.PublicExcellentLevelLanding);
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

Cypress.Commands.add('openPublicGoodAndSatisfactoryLevelPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
  });
  cy.visit(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
});

Cypress.Commands.add(
  'openPublicEnrollmentContactPage',
  (examinerId: number, step = 'tiedot', persistedState = '{}') => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('persist:root', persistedState);
      cy.setCookie('cookie-consent-vkt', 'true');
    });
    cy.visit(`${AppRoutes.PublicEnrollmentContact}/${examinerId}/${step}`);
  },
);

Cypress.Commands.add(
  'openPublicEnrollmentAppointmentPage',
  (enrollmentId: number, step = 'tunnistaudu') => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('persist:root', '{}');
      cy.setCookie('cookie-consent-vkt', 'true');
    });
    cy.visit(
      `${AppRoutes.PublicEnrollmentAppointment}/${enrollmentId}/${step}`,
    );
  },
);

Cypress.Commands.add('openClerkExcellentLevelPage', () => {
  cy.window().then((win) => win.sessionStorage.setItem('persist:root', '{}'));
  cy.visit(AppRoutes.ClerkExcellentLevelPage);
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

Cypress.Commands.add('openExaminerPage', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('persist:root', '{}');
    cy.setCookie('cookie-consent-vkt', 'true');
  });
  cy.visit(AppRoutes.ExaminerRoot);
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
