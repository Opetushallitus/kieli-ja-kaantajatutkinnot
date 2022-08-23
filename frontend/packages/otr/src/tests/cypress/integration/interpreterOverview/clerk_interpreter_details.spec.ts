import { APIEndpoints } from 'enums/api';
import { AppRoutes, UIMode } from 'enums/app';
import {
  interpreterResponse,
  qualification,
} from 'tests/cypress/fixtures/ts/clerkInterpreterOverview';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { onClerkInterpreterOverviewPage } from 'tests/cypress/support/page-objects/clerkInterpreterOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';

beforeEach(() => {
  cy.intercept(APIEndpoints.ClerkInterpreter, {
    fixture: 'clerk_interpreters_10.json',
  });

  cy.intercept(
    `${APIEndpoints.ClerkInterpreter}/${interpreterResponse.id}`,
    interpreterResponse
  ).as('getClerkTranslatorOverview');

  const updatedExistingTranslator = {
    ...interpreterResponse,
    version: 1,
    lastName: 'new last name',
  };
  cy.intercept(
    'PUT',
    APIEndpoints.ClerkInterpreter,
    updatedExistingTranslator
  ).as('updateClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:ClerkTranslatorDetails', () => {
  it('should open edit mode when the edit button is clicked', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.expectMode(UIMode.EditInterpreterDetails);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.clickCancelInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
  });

  it('should disable details save button when the required fields are not filled out', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.editInterpreterField(
      'firstName',
      'input',
      '{backspace}'
    );
    onClerkInterpreterOverviewPage.expectDisabledSaveInterpreterDetailsButton();

    onClerkInterpreterOverviewPage.editInterpreterField(
      'firstName',
      'input',
      'new First name'
    );
    onClerkInterpreterOverviewPage.editInterpreterField(
      'lastName',
      'input',
      '{backspace}'
    );
    onClerkInterpreterOverviewPage.expectDisabledSaveInterpreterDetailsButton();
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
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
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
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

  it.skip('should update translator details successfully', () => {
    const fieldName = 'lastName';
    const fieldType = 'input';
    const newLastName = 'new last name';

    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkInterpreterOverviewPage.clickEditInterpreterDetailsButton();
    onClerkInterpreterOverviewPage.editInterpreterField(
      fieldName,
      fieldType,
      newLastName
    );
    onClerkInterpreterOverviewPage.clickSaveInterpreterDetailsButton();
    cy.wait('@updateClerkTranslatorOverview');

    onClerkInterpreterOverviewPage.expectMode(UIMode.View);
    onClerkInterpreterOverviewPage.expectInterpreterDetailsFieldValue(
      fieldName,
      fieldType,
      newLastName
    );
    onToast.expectText('Tiedot tallennettiin');

    // Ensure navigation protection is no longer enabled after saving.
    onClerkInterpreterOverviewPage.navigateBackToRegister();
    cy.isOnPage(AppRoutes.ClerkHomePage);
    onClerkHomePage.expectFilteredInterpretersCount(10);
  });

  it.skip('should add authorisation succesfully', () => {
    cy.fixture('meeting_dates_10.json')
      .then((dates) => {
        cy.intercept('GET', APIEndpoints.MeetingDate, dates);
      })
      .as('getMeetingDates');

    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    cy.wait('@getMeetingDates');

    onClerkInterpreterOverviewPage.clickAddQualificationButton();
    onClerkInterpreterOverviewPage.fillOutAddQualificationFields();
    onClerkInterpreterOverviewPage.toggleAddQualificationPermissionToPublishSwitch();

    cy.intercept(`${APIEndpoints.ClerkInterpreter}/${interpreterResponse.id}`, {
      ...interpreterResponse,
      qualifications: [...interpreterResponse.qualifications, qualification],
    });

    cy.intercept(
      'POST',
      `${APIEndpoints.ClerkInterpreter}/${interpreterResponse.id}/authorisation`,
      {
        ...interpreterResponse,
        qualifications: [...interpreterResponse.qualifications, qualification],
      }
    );

    onClerkInterpreterOverviewPage.saveQualification();

    onToast.expectText('Rekisteröinti lisätty onnistuneesti');
    onClerkInterpreterOverviewPage.expectQualificationRowToExist(9);
  });

  it('should show disabled fields correctly', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkInterpreterOverviewPage.clickAddQualificationButton();

    onClerkInterpreterOverviewPage.expectDisabledAddQualificationField(
      'endDate',
      'input'
    );
  });

  it.skip('should not allow adding authorisation if required fields are not filled', () => {
    cy.fixture('meeting_dates_10.json')
      .then((dates) => {
        cy.intercept('GET', APIEndpoints.MeetingDate, dates);
      })
      .as('getMeetingDates');
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    cy.wait('@getMeetingDates');

    onClerkInterpreterOverviewPage.clickAddQualificationButton();

    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'from',
      'input',
      'suomi'
    );

    onClerkInterpreterOverviewPage.expectSaveButtonDisabled();

    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'to',
      'input',
      'ruotsi'
    );
    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'basis',
      'input',
      'kkt'
    );
    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'termBeginDate',
      'input',
      '1.1.2022'
    );
    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'diaryNumber',
      'input',
      '1337'
    );

    onClerkInterpreterOverviewPage.expectSaveButtonEnabled();

    onClerkInterpreterOverviewPage.fillOutAddQualificationField(
      'basis',
      'input',
      'aut'
    );

    onClerkInterpreterOverviewPage.expectSaveButtonDisabled();
  });

  it('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');
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
    onClerkInterpreterOverviewPage.navigateById(interpreterResponse.id);
    cy.wait('@getClerkTranslatorOverview');

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
    onClerkInterpreterOverviewPage.editInterpreterField(
      'email',
      'input',
      'mail'
    );
    onClerkInterpreterOverviewPage.editInterpreterField(
      'identityNumber',
      'input',
      'id'
    );

    cy.findAllByText('Tieto on pakollinen').should('have.length', 2);
    onClerkInterpreterOverviewPage.expectText(
      'Henkilötunnuksen muotoa ei tunnistettu'
    );
    onClerkInterpreterOverviewPage.expectText(
      'Sähköpostiosoite on virheellinen'
    );
  });
});
