import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { translatorResponse } from 'tests/cypress/fixtures/ts/clerkTranslator';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';

beforeEach(() => {
  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse
  ).as('getClerkTranslatorOverview');
  onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
  cy.wait('@getClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:Page', () => {
  it('should display a "not found" message if no translator exists with the id given as the route parameter', () => {
    onClerkTranslatorOverviewPage.navigateById(1234567890);
    onClerkTranslatorOverviewPage.expectTranslatorNotFoundText();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should allow navigating back to clerk home page by clicking on the back button', () => {
    onClerkTranslatorOverviewPage.navigateBackToRegister();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should go back onto the clerk home page when the back button of the browser is clicked', () => {
    cy.openClerkHomePage();
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.goBack();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });
});
