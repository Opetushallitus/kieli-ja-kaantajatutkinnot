import { APIEndpoints } from 'enums/api';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { interpreterResponse } from 'tests/cypress/fixtures/ts/clerkInterpreterOverview';
import { onClerkInterpreterOverviewPage } from 'tests/cypress/support/page-objects/clerkInterpreterOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import {
  onQualificationDetails,
  publishPermissionChangeResponse,
  qualificationRemoveResponse,
} from 'tests/cypress/support/page-objects/qualificationDetails';

const effectiveQualificationId = 7;

beforeEach(() => {
  cy.intercept(
    `${APIEndpoints.ClerkInterpreter}/${interpreterResponse.id}`,
    interpreterResponse
  ).as('getClerkInterpreterOverview');
  onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
  cy.wait('@getClerkInterpreterOverview');
});

const qualificationsByStatus = {
  [QualificationStatus.Effective]: [{ id: 7, diaryNumber: '12347' }],
  [QualificationStatus.Expired]: [],
};

describe('ClerkInterpreterOverview:QualificationDetails', () => {
  it('should display correct details for qualifications', () => {
    onQualificationDetails.expectVisibleQualifications(
      qualificationsByStatus[QualificationStatus.Effective]
    );

    onQualificationDetails.clickExpiredToggleBtn();
    onQualificationDetails.expectVisibleQualifications(
      qualificationsByStatus[QualificationStatus.Expired]
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and do no changes if user backs out', () => {
    onQualificationDetails.switchPublishPermission(effectiveQualificationId);
    onDialog.expectText('Haluatko varmasti vaihtaa julkaisulupaa?');
    onDialog.clickButtonByText('Takaisin');

    onQualificationDetails.expectPublishPermission(
      effectiveQualificationId,
      true
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and change the publish permission if user confirms', () => {
    onQualificationDetails.expectPublishPermission(
      effectiveQualificationId,
      true
    );

    const putResponse = publishPermissionChangeResponse(
      interpreterResponse,
      effectiveQualificationId,
      false
    );
    cy.intercept('PUT', APIEndpoints.Qualification, putResponse).as(
      'changePublishPermission'
    );

    onQualificationDetails.switchPublishPermission(effectiveQualificationId);
    onDialog.clickButtonByText('Kyllä');
    cy.wait('@changePublishPermission');

    onQualificationDetails.expectPublishPermission(
      effectiveQualificationId,
      false
    );
  });

  it('should open a confirmation dialog when a delete icon is clicked, and do no changes if user backs out', () => {
    onQualificationDetails.clickDeleteButton(effectiveQualificationId);
    onDialog.expectText('Haluatko varmasti poistaa rekisteröinnin?');
    onDialog.clickButtonByText('Takaisin');

    onQualificationDetails.assertRowExists(effectiveQualificationId);
  });

  it('should open a confirmation dialog when a delete icon is clicked, and delete authorisation if user confirms', () => {
    const deletionResponse = qualificationRemoveResponse(
      interpreterResponse,
      effectiveQualificationId
    );
    cy.intercept(
      'DELETE',
      `${APIEndpoints.Qualification}/${effectiveQualificationId}`,
      deletionResponse
    ).as('deleteAuthorisation');

    onQualificationDetails.clickDeleteButton(effectiveQualificationId);
    onDialog.clickButtonByText('Poista rekisteröinti');
    cy.wait('@deleteAuthorisation');

    onQualificationDetails.assertRowDoesNotExist(effectiveQualificationId);
  });
});
