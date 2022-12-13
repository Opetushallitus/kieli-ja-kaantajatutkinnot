import { AppRoutes, UIMode } from 'enums/app';
import { onClerkExamEventOverviewPage } from 'tests/cypress/support/page-objects/clerkExamEventOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';

describe('ClerkExamEventOverview:ClerkExamEventDetails', () => {
  beforeEach(() => {
    onClerkExamEventOverviewPage.navigateById(clerkExamEvent.id);
  });

  it('should open edit mode when the edit button is clicked', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.expectMode(UIMode.Edit);
  });

  it('should return from edit mode when cancel is clicked and no changes were made', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.clickCancelExamEventDetailsButton();
    onClerkExamEventOverviewPage.expectMode(UIMode.View);
  });

  it('should show partial exam abbrevations when all partial exams are not selected', () => {
    onClerkExamEventOverviewPage.expectEnrollmentRowToHaveText(1, 'KI, TY');
    onClerkExamEventOverviewPage.expectEnrollmentRowToHaveText(9, 'PU, PY');
  });

  it('should show full exam when all partial exams are selected', () => {
    onClerkExamEventOverviewPage.expectEnrollmentRowToHaveText(
      2,
      'Koko tutkinto'
    );
  });

  it('should disable details save button when the required fields are not filled out', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();

    [
      ['language', 'Ruotsi'],
      ['level', 'Erinomainen'],
    ].forEach(([fieldName, fieldValue]) => {
      onClerkExamEventOverviewPage.editExamEventField(fieldName, 'input', ' ');
      onClerkExamEventOverviewPage.expectDisabledSaveExamEventDetailsButton();

      onClerkExamEventOverviewPage.editExamEventField(
        fieldName,
        'input',
        fieldValue
      );
      onClerkExamEventOverviewPage.expectEnabledSaveExamEventDetailsButton();
    });

    [
      ['date', '23.12.2022'],
      ['registrationCloses', '16.12.2022'],
    ].forEach(([fieldName, fieldValue]) => {
      onClerkExamEventOverviewPage.editExamEventDateField(fieldName, ' ');
      onClerkExamEventOverviewPage.expectDisabledSaveExamEventDetailsButton();

      onClerkExamEventOverviewPage.editExamEventDateField(
        fieldName,
        fieldValue
      );
      onClerkExamEventOverviewPage.expectEnabledSaveExamEventDetailsButton();
    });
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and stay in edit mode if user backs out', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.editExamEventField(
      'language',
      'input',
      'testiTesti123'
    );
    onClerkExamEventOverviewPage.clickCancelExamEventDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Takaisin');

    onClerkExamEventOverviewPage.expectMode(UIMode.Edit);
  });

  it('should open a confirmation dialog when cancel is clicked if changes were made and return to view mode if user confirms', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.editExamEventField(
      'language',
      'input',
      'testiTesti123'
    );
    onClerkExamEventOverviewPage.clickCancelExamEventDetailsButton();

    onDialog.expectText('Haluatko poistua muokkausnäkymästä?');
    onDialog.clickButtonByText('Kyllä');

    onClerkExamEventOverviewPage.expectMode(UIMode.View);
  });

  it('should update interpreter details successfully', () => {
    const fieldName = 'language';
    const fieldType = 'input';
    const newLanguage = 'Ruotsi';

    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.editExamEventField(
      fieldName,
      fieldType,
      newLanguage
    );
    onClerkExamEventOverviewPage.expectPageHeader(
      'Suomi, erinomainen 22.10.2022'
    );

    onClerkExamEventOverviewPage.clickSaveExamEventDetailsButton();

    onClerkExamEventOverviewPage.expectMode(UIMode.View);
    onClerkExamEventOverviewPage.expectExamEventFieldValue(
      fieldName,
      fieldType,
      newLanguage
    );
    onClerkExamEventOverviewPage.expectPageHeader(
      'Ruotsi, erinomainen 22.10.2022'
    );
    onToast.expectText('Tiedot tallennettiin');

    // Ensure navigation protection is no longer enabled after saving.
    onClerkExamEventOverviewPage.navigateBackToRegister();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });

  it('should display a confirmation dialog if the back button is clicked and there are unsaved changes', () => {
    onClerkExamEventOverviewPage.clickEditExamEventDetailsButton();
    onClerkExamEventOverviewPage.editExamEventField(
      'level',
      'input',
      'testiTesti123'
    );
    onClerkExamEventOverviewPage.navigateBackToRegister();

    onDialog.expectText('Haluatko varmasti poistua sivulta?');
    onDialog.clickButtonByText('Kyllä');
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });
});
