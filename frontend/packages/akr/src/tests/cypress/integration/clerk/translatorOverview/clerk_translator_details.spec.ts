import { APIEndpoints } from 'enums/api';
import { AppRoutes, UIMode } from 'enums/app';
import {
  authorisation,
  translatorResponse,
} from 'tests/cypress/fixtures/ts/clerkTranslatorOverview';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';

beforeEach(() => {
  cy.intercept(APIEndpoints.ClerkTranslator, {
    fixture: 'clerk_translators_10.json',
  });

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`,
    translatorResponse
  ).as('getClerkTranslatorOverview');

  const updatedExistingTranslator = {
    ...translatorResponse,
    version: 1,
    lastName: 'new last name',
  };
  cy.intercept(
    'PUT',
    APIEndpoints.ClerkTranslator,
    updatedExistingTranslator
  ).as('updateClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:ClerkTranslatorDetails', () => {
  it('should open edit mode when the edit button is clicked', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectMode(UIMode.EditTranslatorDetails);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.clickCancelTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.expectMode(UIMode.View);
  });

  it('should disable details save button when the required fields are not filled out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    ['lastName', 'firstName'].forEach((fieldName) => {
      onClerkTranslatorOverviewPage.editTranslatorField(
        fieldName,
        'input',
        ' '
      );
      onClerkTranslatorOverviewPage.expectDisabledSaveTranslatorDetailsButton();

      onClerkTranslatorOverviewPage.editTranslatorField(
        fieldName,
        'input',
        'test'
      );
      onClerkTranslatorOverviewPage.expectEnabledSaveTranslatorDetailsButton();
    });
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkTranslatorOverviewPage.clickCancelTranslatorDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Takaisin');

    onClerkTranslatorOverviewPage.expectMode(UIMode.EditTranslatorDetails);
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and return to view mode if user confirms', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkTranslatorOverviewPage.clickCancelTranslatorDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Kyllä');

    onClerkTranslatorOverviewPage.expectMode(UIMode.View);
  });

  it('should update translator details successfully', () => {
    const fieldName = 'lastName';
    const fieldType = 'input';
    const newLastName = 'new last name';

    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField(
      fieldName,
      fieldType,
      newLastName
    );
    onClerkTranslatorOverviewPage.expectAssuranceErrorLabel('not.exist');
    onClerkTranslatorOverviewPage.toggleAssuranceSwitch();
    onClerkTranslatorOverviewPage.expectAssuranceErrorLabel('be.visible');
    onClerkTranslatorOverviewPage.clickSaveTranslatorDetailsButton();
    cy.wait('@updateClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.expectMode(UIMode.View);
    onClerkTranslatorOverviewPage.expectTranslatorDetailsFieldValue(
      fieldName,
      fieldType,
      newLastName
    );
    onToast.expectText('Tiedot tallennettiin');

    // Ensure navigation protection is no longer enabled after saving.
    onClerkTranslatorOverviewPage.navigateBackToRegister();
    cy.isOnPage(AppRoutes.ClerkHomePage);
    onClerkHomePage.expectTotalTranslatorsCount(10);
  });

  it('should add authorisation succesfully', () => {
    cy.fixture('meeting_dates_10.json')
      .then((dates) => {
        cy.intercept('GET', APIEndpoints.MeetingDate, dates);
      })
      .as('getMeetingDates');

    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    cy.wait('@getMeetingDates');

    onClerkTranslatorOverviewPage.clickAddAuthorisationBtn();
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationFields();
    onClerkTranslatorOverviewPage.toggleAddAuthorisationPermissionToPublishSwitch();

    cy.intercept(`${APIEndpoints.ClerkTranslator}/${translatorResponse.id}`, {
      ...translatorResponse,
      authorisations: [...translatorResponse.authorisations, authorisation],
    });

    cy.intercept(
      'POST',
      `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}/authorisation`,
      {
        ...translatorResponse,
        authorisations: [...translatorResponse.authorisations, authorisation],
      }
    );

    onClerkTranslatorOverviewPage.saveAuthorisation();

    onToast.expectText('Auktorisointi lisätty onnistuneesti');
    onClerkTranslatorOverviewPage.expectAuthorisationRowToExist(10004);
  });

  it('should show disabled fields correctly', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickAddAuthorisationBtn();

    onClerkTranslatorOverviewPage.expectDisabledAddAuthorisationField(
      'examinationDate',
      'input'
    );
    onClerkTranslatorOverviewPage.expectDisabledAddAuthorisationField(
      'termEndDate',
      'input'
    );
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'basis',
      'input',
      'kkt'
    );
    onClerkTranslatorOverviewPage.expectDisabledAddAuthorisationField(
      'examinationDate',
      'input'
    );
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'basis',
      'input',
      'aut'
    );
    onClerkTranslatorOverviewPage.expectEnabledAddAuthorisationField(
      'examinationDate',
      'input'
    );
  });

  it('should not allow adding authorisation if required fields are not filled', () => {
    cy.fixture('meeting_dates_10.json')
      .then((dates) => {
        cy.intercept('GET', APIEndpoints.MeetingDate, dates);
      })
      .as('getMeetingDates');
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    cy.wait('@getMeetingDates');

    onClerkTranslatorOverviewPage.clickAddAuthorisationBtn();

    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'from',
      'input',
      'suomi'
    );

    onClerkTranslatorOverviewPage.expectSaveButtonDisabled();

    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'to',
      'input',
      'ruotsi'
    );
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'basis',
      'input',
      'kkt'
    );
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'termBeginDate',
      'input',
      '01.01.2022'
    );
    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'diaryNumber',
      'input',
      '1337'
    );

    onClerkTranslatorOverviewPage.expectSaveButtonEnabled();

    onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
      'basis',
      'input',
      'aut'
    );

    onClerkTranslatorOverviewPage.expectSaveButtonDisabled();
  });

  it('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkTranslatorOverviewPage.navigateBackToRegister();

    onDialog.expectText('Haluatko varmasti poistua sivulta?');
    onDialog.clickButtonByText('Kyllä');
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should show field errors when inputs are not valid', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField('lastName', 'input', ' ');
    onClerkTranslatorOverviewPage.editTranslatorField(
      'firstName',
      'input',
      ' '
    );
    onClerkTranslatorOverviewPage.editTranslatorField('email', 'input', 'mail');
    onClerkTranslatorOverviewPage.editTranslatorField(
      'identityNumber',
      'input',
      'id'
    );

    cy.findAllByText('Tieto on pakollinen').should('have.length', 2);
    onClerkTranslatorOverviewPage.expectText(
      'Henkilötunnuksen muotoa ei tunnistettu'
    );
    onClerkTranslatorOverviewPage.expectText(
      'Sähköpostiosoite on virheellinen'
    );
  });
});
