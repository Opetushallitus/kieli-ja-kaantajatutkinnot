import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { newTranslatorResponse } from 'tests/cypress/fixtures/ts/clerkNewTranslator';
import { onClerkNewTranslatorPage } from 'tests/cypress/support/page-objects/clerkNewTranslatorPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';

const NEW_PERSON_SSN_NOT_IN_ONR = '090687-913J';
const NEW_PERSON_SSN_EXISTS_IN_ONR = '170688-935N';

beforeEach(() => {
  cy.intercept(APIEndpoints.ClerkTranslator, {
    fixture: 'clerk_translators_10.json',
  }).as('getClerkTranslators');

  cy.intercept('GET', APIEndpoints.MeetingDate, {
    fixture: 'meeting_dates_10.json',
  });

  cy.openClerkHomePage();
});

describe('ClerkAddNewTranslator', () => {
  it('should add new translator with authorisation successfully', () => {
    cy.intercept(
      'GET',
      APIEndpoints.ClerkPersonSearch +
        '?identityNumber=' +
        NEW_PERSON_SSN_NOT_IN_ONR,
      ''
    ).as('searchByIdentityNumber');
    cy.intercept(
      'POST',
      APIEndpoints.ClerkTranslator,
      newTranslatorResponse
    ).as('createTranslatorResponse');

    onClerkNewTranslatorPage.clickAddNewTranslatorButton();
    onClerkNewTranslatorPage.typeSocialSecurityNumber(
      NEW_PERSON_SSN_NOT_IN_ONR
    );
    onClerkNewTranslatorPage.clickSearchButton();
    cy.wait('@searchByIdentityNumber');
    onClerkNewTranslatorPage.clickProceedButton();
    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields();
    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationExtraInformation(
      'Lisätiedot'
    );
    onClerkNewTranslatorPage.clickNewTranslatorAssuranceSwitch();
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAuthorisationFields();
    onClerkNewTranslatorPage.clickAuthorisationSaveButton();
    onClerkNewTranslatorPage.expectAuthorisationRowToExist(0);
    onClerkNewTranslatorPage.clickSaveNewClerkButton();
    cy.wait('@createTranslatorResponse');

    onToast.expectText('Kääntäjän tiedot tallennettiin!');
    const expectedTranslatorPage =
      AppRoutes.ClerkTranslatorOverviewPage.replace(
        /:translatorId$/,
        `${newTranslatorResponse.id}`
      );
    cy.wait('@getClerkTranslators');

    cy.isOnPage(expectedTranslatorPage);
  });

  it('should allow removing added authorisations', () => {
    cy.intercept(
      'GET',
      APIEndpoints.ClerkPersonSearch +
        '?identityNumber=' +
        NEW_PERSON_SSN_EXISTS_IN_ONR,
      newTranslatorResponse
    ).as('searchByIdentityNumber');

    onClerkNewTranslatorPage.clickAddNewTranslatorButton();
    onClerkNewTranslatorPage.typeSocialSecurityNumber(
      NEW_PERSON_SSN_EXISTS_IN_ONR
    );
    onClerkNewTranslatorPage.clickSearchButton();
    cy.wait('@searchByIdentityNumber');
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAuthorisationFields();
    onClerkNewTranslatorPage.clickAuthorisationSaveButton();
    onClerkNewTranslatorPage.expectAuthorisationRowToExist(0);
    onClerkNewTranslatorPage.clickDeleteAuthorisationButton(0);
    onClerkNewTranslatorPage.clickDeleteAuthorisationDialogConfirmButton();
    onClerkNewTranslatorPage.expectAuthorisationsTableToNotExist();
  });

  it('should not add new translator with missing fields', () => {
    cy.intercept(
      'GET',
      APIEndpoints.ClerkPersonSearch +
        '?identityNumber=' +
        NEW_PERSON_SSN_NOT_IN_ONR,
      ''
    ).as('searchByIdentityNumber');
    cy.intercept(
      'POST',
      APIEndpoints.ClerkTranslator,
      createAPIErrorResponse()
    ).as('createTranslatorResponse');

    onClerkNewTranslatorPage.clickAddNewTranslatorButton();
    onClerkNewTranslatorPage.typeSocialSecurityNumber(
      NEW_PERSON_SSN_NOT_IN_ONR
    );
    onClerkNewTranslatorPage.clickSearchButton();
    cy.wait('@searchByIdentityNumber');
    onClerkNewTranslatorPage.clickProceedButton();

    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields([
      {
        fieldName: 'lastName',
        fieldType: 'input',
        value: 'Doeline',
      },
    ]);
    onClerkNewTranslatorPage.clickAddAuthorisationButton();
    onClerkNewTranslatorPage.fillOutAuthorisationFields();
    onClerkNewTranslatorPage.clickAuthorisationSaveButton();
    onClerkNewTranslatorPage.expectAuthorisationRowToExist(0);

    onClerkNewTranslatorPage.expectSaveNewClerkButtonDisabled();

    onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationFields([
      {
        fieldName: 'firstName',
        fieldType: 'input',
        value: 'John',
      },
      {
        fieldName: 'nickName',
        fieldType: 'input',
        value: 'John',
      },
    ]);
    onClerkNewTranslatorPage.expectSaveNewClerkButtonEnabled();
  });
});
