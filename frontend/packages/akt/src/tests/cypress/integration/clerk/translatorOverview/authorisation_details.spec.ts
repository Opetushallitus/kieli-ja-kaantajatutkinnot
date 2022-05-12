import { APIEndpoints } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { translatorResponse } from 'tests/cypress/fixtures/ts/clerkTranslatorOverview';
import {
  authorisationDeletionResponse,
  onAuthorisationDetails,
  publishPermissionChangeResponse,
} from 'tests/cypress/support/page-objects/authorisationDetails';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { useFixedDate } from 'tests/cypress/support/utils/date';
import { getDayjs } from 'utils/dayjs';

const dayjs = getDayjs();
const fixedDateForTests = dayjs('2022-01-17T12:35:00+0200');
const effectiveAuthorisationId = 10001;

beforeEach(() => {
  useFixedDate(fixedDateForTests);

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse
  ).as('getClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:AuthorisationDetails', () => {
  it('should display correct details for authorisations', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onAuthorisationDetails.expectAuthorisationDetails(
      translatorResponse,
      AuthorisationStatus.Authorised
    );

    onAuthorisationDetails.clickExpiredToggleBtn();
    onAuthorisationDetails.expectAuthorisationDetails(
      translatorResponse,
      AuthorisationStatus.Expired
    );

    onAuthorisationDetails.clickformerVIRToggleBtn();
    onAuthorisationDetails.expectAuthorisationDetails(
      translatorResponse,
      AuthorisationStatus.FormerVIR
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and do no changes if user backs out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onAuthorisationDetails.switchPublishPermission(effectiveAuthorisationId);
    onDialog.expectText('Haluatko varmasti vaihtaa julkaisulupaa?');
    onDialog.clickButtonByText('Takaisin');

    onAuthorisationDetails.expectPublishPermission(
      effectiveAuthorisationId,
      true
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and change the publish permission if user confirms', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onAuthorisationDetails.expectPublishPermission(
      effectiveAuthorisationId,
      true
    );

    const putResponse = publishPermissionChangeResponse(
      translatorResponse,
      effectiveAuthorisationId,
      false
    );
    cy.intercept(
      'PUT',
      APIEndpoints.AuthorisationPublishPermission,
      putResponse
    ).as('changePublishPermission');

    onAuthorisationDetails.switchPublishPermission(effectiveAuthorisationId);
    onDialog.clickButtonByText('Kyllä');
    cy.wait('@changePublishPermission');

    onAuthorisationDetails.expectPublishPermission(
      effectiveAuthorisationId,
      false
    );
  });

  it('should open a confirmation dialog when a delete icon is clicked, and do no changes if user backs out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onAuthorisationDetails.clickDeleteButton(effectiveAuthorisationId);
    onDialog.expectText('Haluatko varmasti poistaa auktorisoinnin?');
    onDialog.clickButtonByText('Takaisin');

    onAuthorisationDetails.assertRowExists(effectiveAuthorisationId);
  });

  it('should open a confirmation dialog when a delete icon is clicked, and delete authorisation if user confirms', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    const deletionResponse = authorisationDeletionResponse(
      translatorResponse,
      effectiveAuthorisationId
    );
    cy.intercept(
      'DELETE',
      `${APIEndpoints.Authorisation}/${effectiveAuthorisationId}`,
      deletionResponse
    ).as('deleteAuthorisation');

    onAuthorisationDetails.clickDeleteButton(effectiveAuthorisationId);
    onDialog.clickButtonByText('Poista auktorisointi');
    cy.wait('@deleteAuthorisation');

    onAuthorisationDetails.assertRowDoesNotExist(effectiveAuthorisationId);
  });
});
