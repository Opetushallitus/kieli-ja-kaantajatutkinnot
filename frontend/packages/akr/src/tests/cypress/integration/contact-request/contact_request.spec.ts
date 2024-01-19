import { APIEndpoints } from 'enums/api';
import {
  expectTextForId,
  fillContactDetailsStep,
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
    () => cy.openPublicHomePage(),
  );
  onPublicTranslatorFilters.filterByLanguagePair(false, 'suomi', 'ruotsi');
  onPublicTranslatorsListing.selectTranslatorRows(TEST_TRANSLATOR_IDS);
  onPublicTranslatorsListing.openContactRequest();
});

describe('ContactRequestPage', () => {
  it('should not allow proceeding if all translators are deselected', () => {
    onContactRequestPage.isNextEnabled();
    TEST_TRANSLATOR_IDS.forEach((id) =>
      onContactRequestPage.deselectTranslator(id),
    );
    onContactRequestPage.isNextDisabled();
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
      onContactRequestPage.submit(),
    );

    onDialog.expectText('Virhe lähetettäessä yhteydenottopyyntöä');
    onDialog.clickButtonByText('Takaisin');

    // Verify last step is shown after dialog is closed
    expectTextForId(
      'contact-request-page__step-heading-PreviewAndSend',
      'Esikatsele ja lähetä',
    );
  });

  it('should redirect to homepage after completing the happy path', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    writeMessageStep();
    previewAndSendStep();

    runWithIntercept(APIEndpoints.ContactRequest, { statusCode: 200 }, () =>
      onContactRequestPage.submit(),
    );

    onContactRequestPage.expectRequestToBeSent();
    onContactRequestPage.homepage();
    onPublicHomePage.isVisible();
  });

  // Form Validation Tests
  it('should show an error if the required contact fields are not filled out', () => {
    verifyTranslatorsStep();
    onContactRequestPage.next();

    onContactRequestPage.fillFieldByLabel(/etunimi/i, ' ');
    onContactRequestPage.fillFieldByLabel(/sukunimi/i, ' ');
    onContactRequestPage.fillFieldByLabel(/sähköposti/i, ' ');
    onContactRequestPage.blurFieldByLabel(/sähköposti/i);

    cy.findAllByText(/tieto on pakollinen/i)
      .should('be.visible')
      .should('have.length', 3);
  });

  it('should show an error and not allow proceeding if the format of email and phone number fields are not correct', () => {
    verifyTranslatorsStep();
    onContactRequestPage.next();

    onContactRequestPage.fillFieldByLabel(
      /puhelinnumero/i,
      'wrong.phone.number',
    );
    onContactRequestPage.blurFieldByLabel(/puhelinnumero/i);
    onContactRequestPage.isNextDisabled();
    onContactRequestPage.fillFieldByLabel(/sähköposti/i, 'wrong.email.com');
    onContactRequestPage.blurFieldByLabel(/sähköposti/i);
    onContactRequestPage.isNextDisabled();

    cy.findByText(/sähköpostiosoite on virheellinen/i).should('be.visible');
    cy.findByText(/puhelinnumero on virheellinen/i).should('be.visible');
  });

  it('should show an error if the message field is empty', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    onContactRequestPage.next();

    onContactRequestPage.fillMessage('{enter}');
    cy.findByText(/tieto on pakollinen/i).should('be.visible');
    onContactRequestPage.isNextDisabled();
  });

  it('should allow submitting the request only if the privacy statement is accepted', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    writeMessageStep();
    onContactRequestPage.next();

    onContactRequestPage.isSubmitDisabled();
    onContactRequestPage.confirmPrivacyStatement();

    onContactRequestPage.isSubmitEnabled();
  });
});
