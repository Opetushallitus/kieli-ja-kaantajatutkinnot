import { APIEndpoints } from 'enums/api';
import { AppRoutes, UIMode } from 'enums/app';
import {
  newAuthorisation,
  translatorFromOnrResponse,
  translatorFromOnrResponseNoAkrAddress,
  translatorOnrAutoAddressResponse,
  translatorResponse,
} from 'tests/cypress/fixtures/ts/clerkTranslator';
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
    translatorResponse,
  ).as('getClerkTranslatorOverview');

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorFromOnrResponse.id}`,
    translatorFromOnrResponse,
  ).as('getClerkTranslatorFromOnrOverview');

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorFromOnrResponseNoAkrAddress.id}`,
    translatorFromOnrResponseNoAkrAddress,
  ).as('getClerkTranslatorFromOnrOverview');

  cy.intercept(
    `${APIEndpoints.ClerkTranslator}/${translatorOnrAutoAddressResponse.id}`,
    translatorOnrAutoAddressResponse,
  ).as('getClerkTranslatorFromOnrAutoAddressOverview');

  const updatedExistingTranslator = {
    ...translatorResponse,
    version: 1,
    lastName: 'new last name',
  };
  cy.intercept(
    'PUT',
    APIEndpoints.ClerkTranslator,
    updatedExistingTranslator,
  ).as('updateClerkTranslatorOverview');
});

describe('ClerkTranslatorOverview:ClerkTranslatorDetails', () => {
  it('should open edit mode when the edit button is clicked', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectMode(UIMode.EditTranslatorDetails);
    onClerkTranslatorOverviewPage.expectEditPrimaryAddressButton(true);
    onClerkTranslatorOverviewPage.expectEditOtherAddressButton(false);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.clickCancelTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.expectMode(UIMode.View);
  });

  it('should show details disabled if fetched from ONR as invidualised', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorFromOnrResponse.id);
    cy.wait('@getClerkTranslatorFromOnrOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectEditPrimaryAddressButton(false);
    onClerkTranslatorOverviewPage.expectEditOtherAddressButton(true);

    ['lastName', 'firstName', 'nickName', 'identityNumber'].forEach(
      (fieldName) => {
        onClerkTranslatorOverviewPage.expectDisabledTranslatorField(
          fieldName,
          'input',
        );
      },
    );

    ['email', 'phoneNumber'].forEach((fieldName) => {
      onClerkTranslatorOverviewPage.expectEnabledTranslatorField(
        fieldName,
        'input',
      );
    });

    onClerkTranslatorOverviewPage.expectEnabledSaveTranslatorDetailsButton();
    cy.findAllByText('Tiedot haettu väestötietojärjestelmästä').should(
      'have.length',
      1,
    );
  });

  it('should disable add address', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectAddAddressButton(false);
  });

  it('should add address', () => {
    onClerkTranslatorOverviewPage.navigateById(
      translatorFromOnrResponseNoAkrAddress.id,
    );
    cy.wait('@getClerkTranslatorFromOnrOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectAddAddressButton(true);
    onClerkTranslatorOverviewPage.clickAddAddressButton();

    [
      ['street', '', 'Kuja 1'],
      ['postalCode', '', '90100'],
      ['town', '', 'Linnahämeen'],
      ['country', '', 'SWE'],
    ].forEach(([fieldName, oldValue, newValue]) => {
      onClerkTranslatorOverviewPage.editAddressField(
        fieldName,
        'input',
        oldValue,
        newValue,
      );
    });

    onDialog.clickButtonByText('Kyllä');

    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('Kuja 1');
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('90100');
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText(
      'Linnahämeen',
    );
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('SWE');
  });

  it('should edit primary address', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectEditOtherAddressButton(false);
    onClerkTranslatorOverviewPage.clickEditPrimaryAddressButton();

    [
      ['street', 'Sibeliuksenkuja 3', 'Kuja 1'],
      ['postalCode', '06100', '90100'],
      ['town', 'Hämeenlinna', 'Linnahämeen'],
      ['country', 'FIN', 'SWE'],
    ].forEach(([fieldName, oldValue, newValue]) => {
      onClerkTranslatorOverviewPage.editAddressField(
        fieldName,
        'input',
        oldValue,
        newValue,
      );
    });

    onDialog.clickButtonByText('Kyllä');

    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('Kuja 1');
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('90100');
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText(
      'Linnahämeen',
    );
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('SWE');
  });

  it('should edit other address', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorFromOnrResponse.id);
    cy.wait('@getClerkTranslatorFromOnrOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    onClerkTranslatorOverviewPage.expectEditPrimaryAddressButton(false);
    onClerkTranslatorOverviewPage.clickEditOtherAddressButton();

    [
      ['street', 'Sibeliuksenkuja 3', 'Kuja 1'],
      ['postalCode', '06100', '90100'],
      ['town', 'Hämeenlinna', 'Linnahämeen'],
      ['country', 'FIN', 'SWE'],
    ].forEach(([fieldName, oldValue, newValue]) => {
      onClerkTranslatorOverviewPage.editAddressField(
        fieldName,
        'input',
        oldValue,
        newValue,
      );
    });

    onDialog.clickButtonByText('Kyllä');

    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('Kuja 1');
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('90100');
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText(
      'Linnahämeen',
    );
    onClerkTranslatorOverviewPage.expectTranslatorOtherAddressText('SWE');
  });

  it('should choose automatically selected address', () => {
    onClerkTranslatorOverviewPage.navigateById(
      translatorOnrAutoAddressResponse.id,
    );
    cy.wait('@getClerkTranslatorFromOnrAutoAddressOverview');

    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText(
      'Runebergintie 2',
    );
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('01200');
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('Turku');
    onClerkTranslatorOverviewPage.expectTranslatorPrimaryAddressText('suomi');
  });

  it('should disable details save button when the required fields are not filled out', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();

    ['lastName', 'firstName', 'nickName'].forEach((fieldName) => {
      onClerkTranslatorOverviewPage.editTranslatorField(
        fieldName,
        'input',
        ' ',
      );
      onClerkTranslatorOverviewPage.expectDisabledSaveTranslatorDetailsButton();

      onClerkTranslatorOverviewPage.editTranslatorField(
        fieldName,
        'input',
        'test',
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
      'testiTesti123',
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
      'testiTesti123',
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
      newLastName,
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
      newLastName,
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
    onClerkTranslatorOverviewPage.fillOutAuthorisationFields();
    onClerkTranslatorOverviewPage.toggleAddAuthorisationPermissionToPublishSwitch();

    const responseBody = {
      ...translatorResponse,
      authorisations: {
        ...translatorResponse.authorisations,
        effective: [
          ...translatorResponse.authorisations.effective,
          newAuthorisation,
        ],
      },
    };
    cy.intercept(
      'POST',
      `${APIEndpoints.ClerkTranslator}/${translatorResponse.id}/authorisation`,
      responseBody,
    );

    onClerkTranslatorOverviewPage.saveAuthorisation();

    onToast.expectText('Auktorisointi lisätty onnistuneesti');
    onClerkTranslatorOverviewPage.expectAuthorisationRowToExist(10004);
  });

  it('should show disabled fields correctly', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');

    onClerkTranslatorOverviewPage.clickAddAuthorisationBtn();

    onClerkTranslatorOverviewPage.expectDisabledAuthorisationField(
      'examinationDate',
      'input',
    );
    onClerkTranslatorOverviewPage.expectDisabledAuthorisationField(
      'termEndDate',
      'input',
    );
    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'basis',
      'input',
      'kkt',
    );
    onClerkTranslatorOverviewPage.expectDisabledAuthorisationField(
      'examinationDate',
      'input',
    );
    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'basis',
      'input',
      'aut',
    );
    onClerkTranslatorOverviewPage.expectEnabledAuthorisationField(
      'examinationDate',
      'input',
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

    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'from',
      'input',
      'suomi',
    );

    onClerkTranslatorOverviewPage.expectSaveAuthorisationButtonDisabled();

    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'to',
      'input',
      'ruotsi',
    );
    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'basis',
      'input',
      'kkt',
    );
    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'termBeginDate',
      'input',
      '01.01.2022',
    );
    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'diaryNumber',
      'input',
      '1337',
    );

    onClerkTranslatorOverviewPage.expectSaveAuthorisationButtonEnabled();

    onClerkTranslatorOverviewPage.fillOutAuthorisationField(
      'basis',
      'input',
      'aut',
    );

    onClerkTranslatorOverviewPage.expectSaveAuthorisationButtonDisabled();
  });

  it('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkTranslatorOverviewPage.navigateById(translatorResponse.id);
    cy.wait('@getClerkTranslatorOverview');
    onClerkTranslatorOverviewPage.clickEditTranslatorDetailsButton();
    onClerkTranslatorOverviewPage.editTranslatorField(
      'lastName',
      'input',
      'testiTesti123',
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
      ' ',
    );
    onClerkTranslatorOverviewPage.editTranslatorField('nickName', 'input', ' ');
    onClerkTranslatorOverviewPage.editTranslatorField('email', 'input', 'mail');
    onClerkTranslatorOverviewPage.expectDisabledTranslatorField(
      'identityNumber',
      'input',
    );

    cy.findAllByText('Tieto on pakollinen').should('have.length', 3);
    onClerkTranslatorOverviewPage.expectText(
      'Henkilötunnuksen muotoa ei tunnistettu',
    );
    onClerkTranslatorOverviewPage.expectText(
      'Sähköpostiosoite on virheellinen',
    );
  });
});
