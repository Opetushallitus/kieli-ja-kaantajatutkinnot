import { APIEndpoints } from 'enums/api';
import {
  expectTextForId,
  fillContactDetailsStep,
  LONG_TEST_MESSAGE,
  onContactRequestPage,
  previewAndSendStep,
  TEST_TRANSLATOR_IDS,
  verifyTranslatorsStep,
  writeMessageStep,
} from 'tests/cypress/support/page-objects/contactRequestPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { onPublicTranslatorFilters } from 'tests/cypress/support/page-objects/publicTranslatorFilters';
import { onPublicTranslatorsListing } from 'tests/cypress/support/page-objects/publicTranslatorsListing';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.PublicTranslator,
    { fixture: 'public_translators_50.json' },
    () => cy.openPublicHomePage()
  );
  onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
  onPublicTranslatorsListing.selectTranslatorRows(TEST_TRANSLATOR_IDS);
  onPublicTranslatorsListing.openContactRequest();
});

describe('ContactRequestPage', () => {
  it('should not allow proceeding if all translators are deselected', () => {
    onContactRequestPage.elements.nextButton().should('be.enabled');
    TEST_TRANSLATOR_IDS.forEach((id) =>
      onContactRequestPage.deselectTranslator(id)
    );
    onContactRequestPage.elements.nextButton().should('be.disabled');
  });

  it('should bring user back to home page if cancel button is clicked', () => {
    onContactRequestPage.cancel();
    onPublicHomePage.isVisible();
  });

  it('should open a confirmation dialog when cancel button is clicked if user has filled in data', () => {
    // First fill some data
    verifyTranslatorsStep();
    fillContactDetailsStep();

    // Click on cancel, then back out => return to contact request form
    onContactRequestPage.cancel();
    onDialog.expectText('Peruuta yhteydenottopyyntö');
    onDialog.clickButtonByText('Takaisin');

    // Click on cancel, then confirm => return to home page
    onContactRequestPage.cancel();
    onDialog.expectText('Peruuta yhteydenottopyyntö');
    onDialog.clickButtonByText('Kyllä');

    onPublicHomePage.isVisible();
  });

  it('should show an error dialog if the backend returns an error', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    writeMessageStep();
    previewAndSendStep();

    runWithIntercept(APIEndpoints.ContactRequest, { statusCode: 400 }, () =>
      onContactRequestPage.submit()
    );

    onDialog.expectText('Virhe lähetettäessä yhteydenottopyyntöä');
    onDialog.clickButtonByText('Takaisin');

    // Verify last step is shown after dialog is closed
    expectTextForId(
      'contact-request-page__step-heading-PreviewAndSend',
      'Esikatsele ja lähetä'
    );
  });

  it('should redirect to homepage after completing the happy path', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    writeMessageStep();
    previewAndSendStep();

    runWithIntercept(APIEndpoints.ContactRequest, { statusCode: 200 }, () =>
      onContactRequestPage.submit()
    );

    onContactRequestPage.expectRequestToBeSent();
    onContactRequestPage.homepage();
    onPublicHomePage.isVisible();
  });

  // Form Validation Tests
  it('should show an error if the required contact fields are not filled out', () => {
    verifyTranslatorsStep();
    onContactRequestPage.next();

    onContactRequestPage.blurFieldByLabel(/etunimi/i);
    onContactRequestPage.blurFieldByLabel(/sukunimi/i);
    onContactRequestPage.blurFieldByLabel(/sähköpostiosoite/i);

    cy.findAllByText(/tieto on pakollinen/i).should('have.length', 3);
  });

  it('should show an error if the format of email and phone number fields are not correct', () => {
    verifyTranslatorsStep();
    onContactRequestPage.next();

    onContactRequestPage.fillFieldByLabel(
      /sähköpostiosoite/i,
      'wrong.email.com'
    );
    onContactRequestPage.fillFieldByLabel(
      /puhelinnumero/i,
      'wrong.phone.number'
    );
    onContactRequestPage.blurFieldByLabel(/puhelinnumero/i);

    onContactRequestPage.elements.nextButton().should('be.disabled');
    cy.findByText(/sähköpostiosoite on virheellinen/i).should('be.visible');
    cy.findByText(/puhelinnumero on virheellinen/i).should('be.visible');
  });

  it('should still allow proceeding if only the phone number field is filled incorrectly', () => {
    verifyTranslatorsStep();
    onContactRequestPage.next();

    // Fill name and email fields correctly
    onContactRequestPage.fillFieldByLabel(/etunimi/i, 'Etunimi');
    onContactRequestPage.fillFieldByLabel(/sukunimi/i, 'Sukunimi');
    onContactRequestPage.fillFieldByLabel(
      /sähköpostiosoite/i,
      'test@example.fi'
    );

    // Type an invalid number to the phone number field
    onContactRequestPage.fillFieldByLabel(/puhelinnumero/i, 'xxx');
    onContactRequestPage.blurFieldByLabel(/puhelinnumero/i);

    // Assert error message
    cy.findByText(/puhelinnumero on virheellinen/i).should('be.visible');
    // Verify user can still proceed
    onContactRequestPage.elements.nextButton().should('be.enabled');
  });

  it('should show an error if the message field is empty or its length exceeds the limit', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    onContactRequestPage.next();

    onContactRequestPage.blurFieldByLabel(/^viesti/i);
    cy.findByText(/tieto on pakollinen/i).should('be.visible');
    onContactRequestPage.elements.nextButton().should('be.disabled');

    onContactRequestPage.pasteToFieldByLabel(/^viesti/i, LONG_TEST_MESSAGE);
    onContactRequestPage.elements.byLabel(/^viesti/i).type('{enter}');

    cy.findByText(/teksti on liian pitkä/i).should('be.visible');
    onContactRequestPage.elements.nextButton().should('be.disabled');
  });
});
