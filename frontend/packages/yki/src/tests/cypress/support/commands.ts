import Cookies from 'js-cookie';

import { AppRoutes } from 'enums/app';

const withCookieConsent = (acceptCookies: boolean) => ({
  onBeforeLoad: () => {
    Cookies.remove('cookie-consent-yki');
    if (acceptCookies) {
      Cookies.set('cookie-consent-yki', 'true');
    }
  },
});

Cypress.Commands.add(
  'openPublicRegistrationPage',
  (acceptCookies: boolean = true) => {
    cy.visit(AppRoutes.Registration, withCookieConsent(acceptCookies));
  }
);

Cypress.Commands.add(
  'openEvaluationOrderPage',
  (id: number, acceptCookies: boolean = true) => {
    cy.visit(
      AppRoutes.ReassessmentOrder.replace(/:evaluationId/, `${id}`),
      withCookieConsent(acceptCookies)
    );
  }
);

Cypress.Commands.add('isOnPage', (page: string) => {
  cy.url().should('include', page);
});
