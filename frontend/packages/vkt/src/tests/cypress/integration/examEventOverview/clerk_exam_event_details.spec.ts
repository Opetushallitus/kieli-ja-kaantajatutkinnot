import { AppRoutes, EnrollmentStatus, UIMode } from 'enums/app';
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
      ['level', 'erinomainen taito'],
    ].forEach(([fieldName, fieldValue]) => {
      onClerkExamEventOverviewPage.clearExamEventField(fieldName, 'input');
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
      'Suomi, erinomainen taito 22.10.2022'
    );

    onClerkExamEventOverviewPage.clickSaveExamEventDetailsButton();

    onClerkExamEventOverviewPage.expectMode(UIMode.View);
    onClerkExamEventOverviewPage.expectExamEventFieldValue(
      fieldName,
      fieldType,
      newLanguage
    );
    onClerkExamEventOverviewPage.expectPageHeader(
      'Ruotsi, erinomainen taito 22.10.2022'
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

  it('should display headings for enrollment status lists', () => {
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.PAID,
      'Ilmoittautuneet: 6'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.SHIFTED_FROM_QUEUE,
      'Jonosta siirretyt / maksu puuttuu: 1'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.QUEUED,
      'Jonoon ilmoittautuneet: 1'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 1'
    );
  });

  it('should allow changing status for queued and payment expecting enrollments', () => {
    onClerkExamEventOverviewPage.expectEnrollmentStatusChangeButtonToHaveText(
      7,
      'Siirrä takaisin jonoon'
    );
    onClerkExamEventOverviewPage.clickChangeEnrollmentStatusButton(7);
    onToast.expectText('Siirto onnistui');

    onClerkExamEventOverviewPage.expectEnrollmentListHeaderNotToExist(
      EnrollmentStatus.SHIFTED_FROM_QUEUE
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.QUEUED,
      'Jonoon ilmoittautuneet: 2'
    );

    onClerkExamEventOverviewPage.expectEnrollmentStatusChangeButtonToHaveText(
      7,
      'Siirrä tutkintoon'
    );
    onClerkExamEventOverviewPage.clickChangeEnrollmentStatusButton(7);
    onToast.expectText('Siirto onnistui');

    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.SHIFTED_FROM_QUEUE,
      'Jonosta siirretyt / maksu puuttuu: 1'
    );
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.QUEUED,
      'Jonoon ilmoittautuneet: 1'
    );
  });

  it('should copy emails to clipboard', () => {
    onClerkExamEventOverviewPage.clickCopyEmailsButton();
    onClerkExamEventOverviewPage.expectClipboardToHaveText(
      'person1@example.invalid\nperson2@example.invalid\nperson3@example.invalid\nperson4@example.invalid\nperson5@example.invalid\nperson6@example.invalid\nperson7@example.invalid\nperson8@example.invalid\nperson9@example.invalid'
    );
    onToast.expectText('9 sähköpostiosoitetta kopioitu leikepöydälle');
  });

  it('should copy only paid enrollment emails to clipboard', () => {
    onClerkExamEventOverviewPage.clickCopyEmailsOpenMenuButton();
    onClerkExamEventOverviewPage.clickCopyEmailsMenuItem(1);
    onClerkExamEventOverviewPage.clickCopyEmailsButton();
    onClerkExamEventOverviewPage.expectClipboardToHaveText(
      'person1@example.invalid\nperson2@example.invalid\nperson3@example.invalid\nperson4@example.invalid\nperson5@example.invalid\nperson6@example.invalid'
    );
    onToast.expectText('6 sähköpostiosoitetta kopioitu leikepöydälle');
  });

  it('should copy only queued enrollment emails to clipboard', () => {
    onClerkExamEventOverviewPage.clickCopyEmailsOpenMenuButton();
    onClerkExamEventOverviewPage.clickCopyEmailsMenuItem(2);
    onClerkExamEventOverviewPage.clickCopyEmailsButton();
    onClerkExamEventOverviewPage.expectClipboardToHaveText(
      'person8@example.invalid'
    );
    onToast.expectText('1 sähköpostiosoite kopioitu leikepöydälle');
  });
});
