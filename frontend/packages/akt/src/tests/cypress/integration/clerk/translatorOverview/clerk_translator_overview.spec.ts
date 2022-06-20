import dayjs from 'dayjs';

import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { translatorResponse } from 'tests/cypress/fixtures/ts/clerkTranslatorOverview';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';
import { useFixedDate } from 'tests/cypress/support/utils/date';

const fixedDateForTests = dayjs('2022-01-17T12:35:00+0200');

beforeEach(() => {
  useFixedDate(fixedDateForTests);

  cy.intercept(APIEndpoints.ClerkTranslator, {
    fixture: 'clerk_translators_10.json',
  });

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse
  ).as('getClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:Page', () => {
  it('should be reachable from the ClerkTranslatorListing via overview link of a translator row', () => {
    cy.openClerkHomePage();
    onClerkHomePage.clickTranslatorOverviewLink(translatorResponse.id);

    onClerkTranslatorOverviewPage.expectedEnabledAddAuthorisationButton();
    onClerkTranslatorOverviewPage.expectEnabledEditTranslatorInfoBtn();
  });

  it('should display correctly translator and authorisations details', () => {
    cy.openClerkHomePage();
    onClerkHomePage.clickTranslatorOverviewLink(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.expectTranslatorDetailsFields({
      ...translatorResponse,
      country: 'Suomi',
    });
  });

  it('should display a "not found" message if no translator exists with the id given as the route parameter', () => {
    onClerkTranslatorOverviewPage.navigateById(1234567890);
    onClerkTranslatorOverviewPage.expectTranslatorNotFoundText();

    onClerkHomePage.expectTotalTranslatorsCount(10);
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should allow navigating back to ClerkHomePage by clicking on the back button', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.navigateBackToRegister();

    onClerkHomePage.expectTotalTranslatorsCount(10);
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should go back onto the clerk home page when the back button of the browser is clicked', () => {
    cy.openClerkHomePage();
    onClerkHomePage.clickTranslatorOverviewLink(translatorResponse.id);
    cy.goBack();

    cy.isOnPage(AppRoutes.ClerkHomePage);
  });
});
