import { APIEndpoints } from 'enums/api';
import { newTranslatorResponse } from 'tests/cypress/fixtures/ts/clerkNewTranslator';
import { onClerkNewTranslatorPage } from 'tests/cypress/support/page-objects/clerkNewTranslatorPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  cy.intercept(APIEndpoints.ClerkTranslator, {
    fixture: 'clerk_translators_10.json',
  });

  cy.intercept('GET', APIEndpoints.MeetingDate, {
    fixture: 'meeting_dates_10.json',
  });

  cy.openClerkHomePage();
});

describe('ClerkAddNewTranslator', () => {
  it('should add new translator with authrotisation successfully', () => {
    cy.intercept(
      'POST',
      APIEndpoints.ClerkTranslator,
      newTranslatorResponse
    ).as('createTranslatorResponse');

    onClerkNewTranslatorPage.clickAddNewTranslatorButton();
    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields();
    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationExtraInformation(
      'Lisätiedot'
    );
    onClerkNewTranslatorPage.clickNewTranslatorAssuranceSwitch();
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAddAuthorisationFields();
    onClerkNewTranslatorPage.addAuthorisation();
    onClerkNewTranslatorPage.expectUnsavedAuthorisationRowToExist(0);
    onClerkNewTranslatorPage.clickSaveNewClerkButton();
    cy.wait('@createTranslatorResponse');
    onToast.expectText('Kääntäjän tiedot tallennettiin!');
  });

  it('should allow removing added authorisations', () => {
    onClerkNewTranslatorPage.clickAddNewTranslatorButton();
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAddAuthorisationFields();
    onClerkNewTranslatorPage.addAuthorisation();
    onClerkNewTranslatorPage.expectUnsavedAuthorisationRowToExist(0);
    onClerkNewTranslatorPage.clickDeleteUnsavedAuthorisationButton(0);
    onClerkNewTranslatorPage.clickDeleteAuthorisationDialogConfirmButton();
    onClerkNewTranslatorPage.expectAuthorisationsTableToNotExist();
  });

  it('should not add new translator with missing fields', () => {
    cy.intercept(
      'POST',
      APIEndpoints.ClerkTranslator,
      createAPIErrorResponse()
    ).as('createTranslatorResponse');

    onClerkNewTranslatorPage.clickAddNewTranslatorButton();

    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields([
      {
        fieldName: 'lastName',
        fieldType: 'input',
        value: 'Doeline',
      },
    ]);
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAddAuthorisationFields();
    onClerkNewTranslatorPage.addAuthorisation();
    onClerkNewTranslatorPage.expectUnsavedAuthorisationRowToExist(0);

    onClerkNewTranslatorPage.expectSaveNewClerkButtonDisabled();

    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields([
      {
        fieldName: 'firstName',
        fieldType: 'input',
        value: 'John',
      },
    ]);
    onClerkNewTranslatorPage.expectSaveNewClerkButtonEnabled();
  });
});
