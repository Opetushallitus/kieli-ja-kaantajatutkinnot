import { Matcher } from '@testing-library/dom';

class ContactRequestPage {
  elements = {
    deselectTranslatorButton: (id: string) =>
      cy
        .findByTestId(`contact-request-page__chosen-translator-id-${id}`)
        .findByTestId('DeleteOutlineIcon'),
    previousButton: () => cy.findByTestId('contact-request-page__previous-btn'),
    nextButton: () => cy.findByTestId('contact-request-page__next-btn'),
    cancelButton: () => cy.findByTestId('contact-request-page__cancel-btn'),
    submitButton: () => cy.findByTestId('contact-request-page__submit-btn'),
    homepageButton: () => cy.findByTestId('contact-request-page__homepage-btn'),
    byLabel: (label: Matcher) =>
      cy.get('.contact-request-page').findByLabelText(label),
  };

  previous() {
    this.elements.previousButton().click();
  }

  next() {
    this.elements.nextButton().click();
  }

  cancel() {
    this.elements.cancelButton().click();
  }

  submit() {
    this.elements.submitButton().click();
  }

  homepage() {
    this.elements.homepageButton().click();
  }

  deselectTranslator(id: string) {
    this.elements.deselectTranslatorButton(id).click();
  }

  fillFieldByLabel(label: Matcher, text: string) {
    this.elements.byLabel(label).type(text);
  }

  pasteToFieldByLabel(label: Matcher, text: string) {
    this.elements.byLabel(label).clear().invoke('val', text).trigger('input');
  }

  blurFieldByLabel(label: Matcher) {
    this.elements.byLabel(label).focus().blur();
  }

  isNextEnabled() {
    this.elements.nextButton().should('be.enabled');
  }

  isNextDisabled() {
    this.elements.nextButton().should('be.disabled');
  }

  expectRequestToBeSent() {
    cy.findByText(
      /Yhteydenottopyyntösi on lähetetty ja sinuun ollaan yhteydessä./i
    ).should('be.visible');
  }
}

export const TEST_TRANSLATOR_IDS = ['602', '1940', '2080'];

export const TEST_CONTACT_DETAILS = {
  firstName: 'Teemu',
  lastName: 'Testaaja',
  email: 'valid@email.org',
};
export const TEST_MESSAGE = 'Kirjoita viestisi tähän';
export const LONG_TEST_MESSAGE = TEST_MESSAGE.repeat(300);

export const onContactRequestPage = new ContactRequestPage();

export const verifyTranslatorsStep = () => {
  onContactRequestPage.deselectTranslator('1940');
};

export const fillContactDetailsStep = () => {
  onContactRequestPage.next();
  onContactRequestPage.isNextDisabled();

  onContactRequestPage.fillFieldByLabel(
    /etunimi/i,
    TEST_CONTACT_DETAILS.firstName
  );
  onContactRequestPage.fillFieldByLabel(
    /sukunimi/i,
    TEST_CONTACT_DETAILS.lastName
  );
  onContactRequestPage.fillFieldByLabel(
    /sähköpostiosoite/i,
    TEST_CONTACT_DETAILS.email
  );

  onContactRequestPage.isNextEnabled();
};

export const writeMessageStep = () => {
  onContactRequestPage.next();
  onContactRequestPage.isNextDisabled();

  onContactRequestPage.fillFieldByLabel(/^Viesti/i, TEST_MESSAGE);

  onContactRequestPage.isNextEnabled();
};

const assertSelectedTranslators = () => {
  expectTextForId(
    'contact-request-page__chosen-translators-text',
    'Ilkka Heinonen, Ninni Korhonen'
  );
};

const assertContactDetails = () => {
  expectTextToBeInDocument(TEST_CONTACT_DETAILS.firstName);
  expectTextToBeInDocument(TEST_CONTACT_DETAILS.lastName);
  expectTextToBeInDocument(TEST_CONTACT_DETAILS.email);
};

export const previewAndSendStep = () => {
  onContactRequestPage.next();

  assertSelectedTranslators();
  assertContactDetails();
};

export const expectTextToBeInDocument = (text: string) =>
  cy.findByDisplayValue(text).should('be.visible');

export const expectTextForId = (id: Matcher, text: string) =>
  cy.findByTestId(id).should('have.text', text);
