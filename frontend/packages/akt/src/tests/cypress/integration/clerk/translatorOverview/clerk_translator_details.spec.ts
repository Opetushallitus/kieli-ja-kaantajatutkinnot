import { APIEndpoints } from 'enums/api';
import { AppRoutes, UIMode } from 'enums/app';
import {
  authorisation,
  translatorResponse,
} from 'tests/cypress/fixtures/ts/clerkTranslatorOverview';
import { onClerkTranslatorOverviewPage } from 'tests/cypress/support/page-objects/clerkTranslatorOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';

beforeEach(() => {
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

    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();

    onClerkTranslatorOverviewPage.expectMode(UIMode.EditTranslatorDetails);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();

    onClerkTranslatorOverviewPage.clickCancelTranslatorInfoBtn();
    onClerkTranslatorOverviewPage.expectMode(UIMode.View);
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkTranslatorOverviewPage.clickCancelTranslatorInfoBtn();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Takaisin');

    onClerkTranslatorOverviewPage.expectMode(UIMode.EditTranslatorDetails);
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and return to view mode if user confirms', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123'
    );
    onClerkTranslatorOverviewPage.clickCancelTranslatorInfoBtn();

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

    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();
    onClerkTranslatorOverviewPage.editTranslatorField(
      fieldName,
      fieldType,
      newLastName
    );
    onClerkTranslatorOverviewPage.expectAssuranceErrorLabel('not.exist');
    onClerkTranslatorOverviewPage.toggleAssuranceSwitch();
    onClerkTranslatorOverviewPage.expectAssuranceErrorLabel('be.visible');
    onClerkTranslatorOverviewPage.clickSaveTranslatorInfoBtn();
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
      '1.1.2022'
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
    onClerkTranslatorOverviewPage.clickEditTranslatorInfoBtn();
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
});
