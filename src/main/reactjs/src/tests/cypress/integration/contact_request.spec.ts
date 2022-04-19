import { APIEndpoints } from 'enums/api';
import {
  LONG_TEST_MESSAGE,
  expectTextForId,
  fillContactDetailsStep,
  onContactRequestPage,
  previewAndSendStep,
  TEST_TRANSLATOR_IDS,
  verifyTranslatorsStep,
  writeMessageStep,
} from 'tests/cypress/support/page-objects/contactRequestPage';
import { onPublicTranslatorFilters } from 'tests/cypress/support/page-objects/publicTranslatorFilters';
import { onPublicTranslatorsListing } from 'tests/cypress/support/page-objects/publicTranslatorsListing';
import { runWithIntercept } from 'tests/cypress/support/utils/api';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';

const selectTranslatorRows = () => {
  TEST_TRANSLATOR_IDS.forEach((id) =>
    onPublicTranslatorsListing.clickTranslatorRow(id)
  );
};

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.PublicTranslator,
    { fixture: 'public_translators_50.json' },
    () => cy.openPublicHomePage()
  );
  onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
  selectTranslatorRows();
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

  it('should open a confirmation dialog when cancel button is clicked', () => {
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

    onDialog.expectText('Virhe lähetettäessä yhteydenottopyyntöä.');
    onDialog.clickButtonByText('Takaisin');

    // Verify last step is shown after dialog is closed
    expectTextForId(
      'contact-request-page__step-heading-previewAndSend',
      'Esikatsele ja lähetä'
    );
  });

  it('should show a success dialog in the end after happy path is completed', () => {
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

    cy.findByText(/sähköpostiosoite on virheellinen/i).should('be.visible');
    cy.findByText(/puhelinnumero on virheellinen/i).should('be.visible');
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

  it('should show an error if the message field is empty or its length exceeds the limit', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    onContactRequestPage.next();

    onContactRequestPage.blurFieldByLabel(/viesti/i);
    cy.findByText(/tieto on pakollinen/i).should('be.visible');
    onContactRequestPage.elements.nextButton().should('be.disabled');

    onContactRequestPage.pasteToFieldByLabel(/viesti/i, LONG_TEST_MESSAGE);
    onContactRequestPage.blurFieldByLabel(/viesti/i);

    cy.findByText(/tekstin pituus ei saa ylittää 1000 merkkiä/i).should(
      'be.visible'
    );
    onContactRequestPage.elements.nextButton().should('be.disabled');
  });
});
