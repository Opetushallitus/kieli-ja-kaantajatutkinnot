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
import { onToast } from 'tests/cypress/support/page-objects/toast';

const effectiveAuthorisationId = 10001;

beforeEach(() => {
  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse
  ).as('getClerkTranslatorOverview');
  onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
  cy.wait('@getClerkTranslatorOverview');
});

const authorisationsByStatus = {
  [AuthorisationStatus.Authorised]: [{ id: 10001, diaryNumber: '10001' }],
  [AuthorisationStatus.Expired]: [
    { id: 10000, diaryNumber: '10000' },
    { id: 10002, diaryNumber: '10002' },
  ],
  [AuthorisationStatus.FormerVIR]: [{ id: 10003, diaryNumber: '10003' }],
};

describe('ClerkTranslatorOverview:AuthorisationDetails', () => {
  it('should display correct details for authorisations', () => {
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.Authorised]
    );

    onAuthorisationDetails.clickExpiredToggleBtn();
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.Expired]
    );

    onAuthorisationDetails.clickformerVIRToggleBtn();
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.FormerVIR]
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and do no changes if user backs out', () => {
    onAuthorisationDetails.switchPublishPermission(effectiveAuthorisationId);
    onDialog.expectText('Haluatko varmasti vaihtaa julkaisulupaa?');
    onDialog.clickButtonByText('Takaisin');

    onAuthorisationDetails.expectPublishPermission(
      effectiveAuthorisationId,
      true
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and change the publish permission if user confirms', () => {
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
    onToast.expectText('Auktorisoinnin julkaisulupaa muutettu');
  });

  it('should open a confirmation dialog when a delete icon is clicked, and do no changes if user backs out', () => {
    onAuthorisationDetails.clickDeleteButton(effectiveAuthorisationId);
    onDialog.expectText('Haluatko varmasti poistaa auktorisoinnin?');
    onDialog.clickButtonByText('Takaisin');

    onAuthorisationDetails.assertRowExists(effectiveAuthorisationId);
  });

  it('should open a confirmation dialog when a delete icon is clicked, and delete authorisation if user confirms', () => {
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
    onToast.expectText('Valittu auktorisointi poistettu');
  });
});
