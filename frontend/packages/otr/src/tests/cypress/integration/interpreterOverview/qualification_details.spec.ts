import { QualificationStatus } from 'enums/clerkInterpreter';
import { onClerkInterpreterOverviewPage } from 'tests/cypress/support/page-objects/clerkInterpreterOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onQualificationDetails } from 'tests/cypress/support/page-objects/qualificationDetails';
import { onToast } from 'tests/cypress/support/page-objects/toast';

const CLERK_INTERPRETER_ID = 11;
const EFFECTIVE_QUALIFICATION_ID = 110;

const qualificationsByStatus = {
  [QualificationStatus.Effective]: [
    { id: 110, diaryNumber: '11000' },
    { id: 111, diaryNumber: '11100' },
  ],
  [QualificationStatus.Expired]: [{ id: 112, diaryNumber: '11200' }],
};

describe('ClerkInterpreterOverview:QualificationDetails', () => {
  beforeEach(() => {
    onClerkInterpreterOverviewPage.navigateById(CLERK_INTERPRETER_ID);
  });

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
    onQualificationDetails.switchPublishPermission(EFFECTIVE_QUALIFICATION_ID);
    onDialog.expectText('Haluatko varmasti vaihtaa julkaisulupaa?');
    onDialog.clickButtonByText('Takaisin');

    onQualificationDetails.expectPublishPermission(
      EFFECTIVE_QUALIFICATION_ID,
      true
    );
  });

  it('should open a confirmation dialog when publish permission switch is clicked, and change the publish permission if user confirms', () => {
    onQualificationDetails.expectPublishPermission(
      EFFECTIVE_QUALIFICATION_ID,
      true
    );

    onQualificationDetails.switchPublishPermission(EFFECTIVE_QUALIFICATION_ID);
    onDialog.clickButtonByText('Kyllä');

    onQualificationDetails.expectPublishPermission(
      EFFECTIVE_QUALIFICATION_ID,
      false
    );
    onToast.expectText('Rekisteröinnin julkaisulupaa muutettu');
  });

  it('should open a confirmation dialog when a delete icon is clicked, and do no changes if user backs out', () => {
    onQualificationDetails.clickDeleteButton(EFFECTIVE_QUALIFICATION_ID);
    onDialog.expectText('Haluatko varmasti poistaa rekisteröinnin?');
    onDialog.clickButtonByText('Takaisin');

    onQualificationDetails.assertRowExists(EFFECTIVE_QUALIFICATION_ID);
  });

  it('should open a confirmation dialog when a delete icon is clicked, and delete authorisation if user confirms', () => {
    onQualificationDetails.clickDeleteButton(EFFECTIVE_QUALIFICATION_ID);
    onDialog.clickButtonByText('Poista rekisteröinti');

    onQualificationDetails.assertRowDoesNotExist(EFFECTIVE_QUALIFICATION_ID);
    onToast.expectText('Valittu rekisteröinti poistettu');
  });
});
