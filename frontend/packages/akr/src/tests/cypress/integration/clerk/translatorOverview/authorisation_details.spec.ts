import { APIEndpoints } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { translatorResponse } from 'tests/cypress/fixtures/ts/clerkTranslator';
import {
  authorisationDeletionResponse,
  onAuthorisationDetails,
} from 'tests/cypress/support/page-objects/authorisationDetails';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';

const authorisationId = translatorResponse.authorisations.effective[0].id;

beforeEach(() => {
  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse,
  ).as('getClerkTranslatorOverview');
  onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
  cy.wait('@getClerkTranslatorOverview');
});

const authorisationsByStatus = {
  [AuthorisationStatus.Effective]: [{ id: 10001, diaryNumber: '10001' }],
  [AuthorisationStatus.Expired]: [
    { id: 10000, diaryNumber: '10000' },
    { id: 10002, diaryNumber: '10002' },
  ],
  [AuthorisationStatus.FormerVir]: [{ id: 10003, diaryNumber: '10003' }],
};

describe('ClerkTranslatorOverview:AuthorisationDetails', () => {
  it('should display correct details for authorisations', () => {
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.Effective],
    );

    onAuthorisationDetails.clickExpiredToggleBtn();
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.Expired],
    );

    onAuthorisationDetails.clickformerVirToggleBtn();
    onAuthorisationDetails.expectVisibleAuthorisations(
      authorisationsByStatus[AuthorisationStatus.FormerVir],
    );
  });

  it('should open a confirmation dialog when a delete icon is clicked, and do no changes if user backs out', () => {
    onAuthorisationDetails.clickDeleteButton(authorisationId);
    onDialog.expectText('Haluatko varmasti poistaa auktorisoinnin?');
    onDialog.clickButtonByText('Takaisin');

    onAuthorisationDetails.assertRowExists(authorisationId);
  });

  it('should open a confirmation dialog when a delete icon is clicked, and delete authorisation if user confirms', () => {
    const deletionResponse = authorisationDeletionResponse(
      translatorResponse,
      authorisationId,
    );
    cy.intercept(
      'DELETE',
      `${APIEndpoints.Authorisation}/${authorisationId}`,
      deletionResponse,
    ).as('deleteAuthorisation');

    onAuthorisationDetails.clickDeleteButton(authorisationId);
    onDialog.clickButtonByText('Poista auktorisointi');
    cy.wait('@deleteAuthorisation');

    onAuthorisationDetails.assertRowDoesNotExist(authorisationId);
    onToast.expectText('Valittu auktorisointi poistettu');
  });
});
