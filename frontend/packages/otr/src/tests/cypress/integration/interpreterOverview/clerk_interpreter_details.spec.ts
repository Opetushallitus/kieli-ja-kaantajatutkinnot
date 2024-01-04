import { AppRoutes, UIMode } from 'enums/app';
import { onClerkInterpreterOverviewPage } from 'tests/cypress/support/page-objects/clerkInterpreterOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onQualificationDetails } from 'tests/cypress/support/page-objects/qualificationDetails';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkInterpreter } from 'tests/msw/fixtures/clerkInterpreter';
import { clerkInterpreterIndividualised } from 'tests/msw/fixtures/clerkInterpreterIndividualised';

describe('ClerkInterpreterOverview:ClerkInterpreterDetails', () => {
  beforeEach(() => {
    onClerkInterpreterOverviewPage.navigateById(clerkInterpreter.id);
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
        ' ',
      );
      onClerkInterpreterOverviewPage.expectDisabledSaveInterpreterDetailsButton();

      onClerkInterpreterOverviewPage.editInterpreterField(
        fieldName,
        'input',
        'test',
      );
      onClerkInterpreterOverviewPage.expectEnabledSaveInterpreterDetailsButton();
    });
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      'testiTesti123',
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
      'testiTesti123',
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
      newLastName,
    );
    onClerkInterpreterOverviewPage.expectTitle(
      `${clerkInterpreter.lastName} ${clerkInterpreter.firstName}`,
    );

    onClerkInterpreterOverviewPage.clickSaveInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
    onClerkInterpreterOverviewPage.expectInterpreterFieldValue(
      fieldName,
      fieldType,
      newLastName,
    );
    onClerkInterpreterOverviewPage.expectTitle(
      `${newLastName} ${clerkInterpreter.firstName}`,
    );
    onToast.expectText('Tiedot tallennettiin');

    // Ensure navigation protection is no longer enabled after saving.
    onClerkInterpreterOverviewPage.clickBackButton();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should add qualification successfully', () => {
    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.expectQualificationSaveButtonDisabled();
    onClerkInterpreterOverviewPage.fillOutQualificationFields();
    onClerkInterpreterOverviewPage.toggleQualificationPermissionToPublishSwitch();

    onClerkInterpreterOverviewPage.clickSaveQualification();

    onQualificationDetails.assertRowExists(99);
    onToast.expectText('Rekisteröinti lisätty onnistuneesti');
  });

  it('should show disabled fields in qualification add modal correctly', () => {
    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.expectDisabledAddQualificationField(
      'endDate',
      'input',
    );
  });

  it.skip('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      'testiTesti123',
    );
    onClerkInterpreterOverviewPage.clickBackButton();

    onDialog.expectText('Haluatko varmasti poistua sivulta?');
    onDialog.clickButtonByText('Kyllä');
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should show field errors when inputs are not valid', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      ' ',
    );
    onClerkInterpreterOverviewPage.editInterpreterField(
      'firstName',
      'input',
      ' ',
    );
    onClerkInterpreterOverviewPage.editInterpreterField('email', 'input', ' ');
    cy.findAllByText('Tieto on pakollinen').should('have.length', 3);

    onClerkInterpreterOverviewPage.editInterpreterField(
      'email',
      'input',
      'mail',
    );
    onClerkInterpreterOverviewPage.expectText(
      'Sähköpostiosoite on virheellinen',
    );

    onClerkInterpreterOverviewPage.editInterpreterField(
      'phoneNumber',
      'input',
      'xyz',
    );
    onClerkInterpreterOverviewPage.expectText('Puhelinnumero on virheellinen');
  });

  it('should show identity number as the only disabled personal information field for a non-individualised interpreter', () => {
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    ['lastName', 'firstName', 'nickName'].forEach((field) => {
      onClerkInterpreterOverviewPage.expectEnabledInterpreterField(
        field,
        'input',
      );
    });
    onClerkInterpreterOverviewPage.expectDisabledInterpreterField(
      'identityNumber',
      'input',
    );
  });

  it('should show each personal information field as disabled for an individualised interpreter', () => {
    onClerkInterpreterOverviewPage.navigateById(
      clerkInterpreterIndividualised.id,
    );
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    ['lastName', 'firstName', 'nickName', 'identityNumber'].forEach((field) => {
      onClerkInterpreterOverviewPage.expectDisabledInterpreterField(
        field,
        'input',
      );
    });
  });
});
