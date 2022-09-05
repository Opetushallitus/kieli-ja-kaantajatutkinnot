import { AppRoutes, UIMode } from 'enums/app';
import { onClerkInterpreterOverviewPage } from 'tests/cypress/support/page-objects/clerkInterpreterOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onQualificationDetails } from 'tests/cypress/support/page-objects/qualificationDetails';
import { onToast } from 'tests/cypress/support/page-objects/toast';

const INTERPRETER_ID = 11;

describe('ClerkInterpreterOverview:ClerkInterpreterDetails', () => {
  beforeEach(() => {
    onClerkInterpreterOverviewPage.navigateById(INTERPRETER_ID);
  });

  it('should open edit mode when the edit button is clicked', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.expectMode(UIMode.EditInterpreterDetails);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.clickCancelInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
  });

  it('should disable details save button when the required fields are not filled out', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    ['lastName', 'firstName', 'nickName', 'email'].forEach((fieldName) => {
      onClerkInterpreterOverviewPage.editInterpreterField(
        fieldName,
        'input',
        ' '
      );
      onClerkInterpreterOverviewPage.expectDisabledSaveInterpreterDetailsButton();

      onClerkInterpreterOverviewPage.editInterpreterField(
        fieldName,
        'input',
        'test'
      );
      onClerkInterpreterOverviewPage.expectEnabledSaveInterpreterDetailsButton();
    });
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkInterpreterOverviewPage.clickCancelInterpreterDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Takaisin');

    onClerkInterpreterOverviewPage.expectMode(UIMode.EditInterpreterDetails);
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and return to view mode if user confirms', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkInterpreterOverviewPage.clickCancelInterpreterDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Kyllä');

    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
  });

  it('should update interpreter details successfully', () => {
    const fieldName = 'lastName';
    const fieldType = 'input';
    const newLastName = 'new last name';

    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      fieldName,
      fieldType,
      newLastName
    );
    onClerkInterpreterOverviewPage.clickSaveInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
    onClerkInterpreterOverviewPage.expectInterpreterFieldValue(
      fieldName,
      fieldType,
      newLastName
    );
    onToast.expectText('Tiedot tallennettiin');

    // Ensure navigation protection is no longer enabled after saving.
    onClerkInterpreterOverviewPage.navigateBackToRegister();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should add qualification successfully', () => {
    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.fillOutAddQualificationFields();
    onClerkInterpreterOverviewPage.toggleAddQualificationPermissionToPublishSwitch();

    onClerkInterpreterOverviewPage.saveQualification();

    onQualificationDetails.assertRowExists(99);
    onToast.expectText('Rekisteröinti lisätty onnistuneesti');
  });

  it('should show disabled fields in qualification add modal correctly', () => {
    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.expectDisabledAddQualificationField(
      'endDate',
      'input'
    );
  });

  it('should not allow adding qualification if required fields are not filled', () => {
    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.fillOutAddQualificationFields();
    onClerkInterpreterOverviewPage.expectQualificationSaveButtonEnabled();

    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'diaryNumber',
      'input',
      ''
    );
    onClerkInterpreterOverviewPage.expectQualificationSaveButtonDisabled();
  });

  it('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkInterpreterOverviewPage.navigateBackToRegister();

    onDialog.expectText('Haluatko varmasti poistua sivulta?');
    onDialog.clickButtonByText('Kyllä');
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should show field errors when inputs are not valid', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      ' '
    );
    onClerkInterpreterOverviewPage.editInterpreterField(
      'firstName',
      'input',
      ' '
    );
    onClerkInterpreterOverviewPage.editInterpreterField('email', 'input', ' ');
    cy.findAllByText('Tieto on pakollinen').should('have.length', 3);

    onClerkInterpreterOverviewPage.editInterpreterField(
      'email',
      'input',
      'mail'
    );
    onClerkInterpreterOverviewPage.expectText(
      'Sähköpostiosoite on virheellinen'
    );
  });

  it('should show identity number as the only disabled personal information field for a non-individualised interpreter', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    ['lastName', 'firstName', 'nickName'].forEach((field) => {
      onClerkInterpreterOverviewPage.expectEnabledInterpreterField(
        field,
        'input'
      );
    });
    onClerkInterpreterOverviewPage.expectDisabledInterpreterField(
      'identityNumber',
      'input'
    );
  });

  it('should show each personal information field as disabled for an individualised interpreter', () => {
    onClerkInterpreterOverviewPage.navigateById(12);
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    ['lastName', 'firstName', 'nickName', 'identityNumber'].forEach((field) => {
      onClerkInterpreterOverviewPage.expectDisabledInterpreterField(
        field,
        'input'
      );
    });
  });
});
