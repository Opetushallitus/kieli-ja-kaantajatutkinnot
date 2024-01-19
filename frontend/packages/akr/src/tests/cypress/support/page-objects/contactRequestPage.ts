import { Matcher } from '@testing-library/dom';

import { ContactDetails } from 'interfaces/contactRequest';

class ContactRequestPage {
  elements = {
    deselectTranslatorButton: (id: string) =>
      cy.findByTestId(`contact-request-page__deselect-translator-id-${id}-btn`),
    previousButton: () => cy.findByTestId('contact-request-page__previous-btn'),
    nextButton: () => cy.findByTestId('contact-request-page__next-btn'),
    cancelButton: () => cy.findByTestId('contact-request-page__cancel-btn'),
    submitButton: () => cy.findByTestId('contact-request-page__submit-btn'),
    homepageButton: () => cy.findByTestId('contact-request-page__homepage-btn'),
    byLabel: (label: Matcher) =>
      cy.get('.contact-request-page').findByLabelText(label),
    privacyStatementCheckbox: () =>
      cy.findByTestId('contact-request-page__privacy-statement-checkbox'),
    contactDetailText: (detail: keyof ContactDetails) =>
      cy.findByTestId(`contact-request-page__contact-detail__${detail}`),
    messageField: () => cy.findByTestId('contact-request-page__message-field'),
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
    this.elements.deselectTranslatorButton(id).should('be.visible').click();
  }

  fillFieldByLabel(label: Matcher, text: string) {
    this.elements.byLabel(label).type(text);
  }

  fillMessage(text: string) {
    this.elements.messageField().type(text);
  }

  pasteToFieldByLabel(label: Matcher, text: string) {
    this.elements.byLabel(label).clear().invoke('val', text).trigger('input');
  }

  blurFieldByLabel(label: Matcher) {
    this.elements.byLabel(label).focus().blur();
  }

  confirmPrivacyStatement() {
    this.elements.privacyStatementCheckbox().should('be.visible').click();
  }

  isNextEnabled() {
    this.elements.nextButton().should('be.enabled');
  }

  isNextDisabled() {
    this.elements.nextButton().should('be.disabled');
  }

  isSubmitEnabled() {
    this.elements.submitButton().should('be.enabled');
  }

  isSubmitDisabled() {
    this.elements.submitButton().should('be.disabled');
  }

  expectRequestToBeSent() {
    cy.findByText(
      /Yhteydenottopyyntösi on lähetetty ja sinuun ollaan yhteydessä./i,
    ).should('be.visible');
  }

  expectContactDetailText(detail: keyof ContactDetails, text: string) {
    this.elements.contactDetailText(detail).should('contain.text', text);
  }
}

export const TEST_TRANSLATOR_IDS = ['602', '1940', '2080'];

export const TEST_CONTACT_DETAILS = {
  firstName: 'Teemu',
  lastName: 'Testaaja',
  email: 'valid@email.org',
};
export const TEST_MESSAGE = 'Kirjoita viestisi tähän';

export const onContactRequestPage = new ContactRequestPage();

export const verifyTranslatorsStep = () => {
  onContactRequestPage.deselectTranslator('1940');
};

export const fillContactDetailsStep = () => {
  onContactRequestPage.next();
  onContactRequestPage.isNextDisabled();

  onContactRequestPage.fillFieldByLabel(
    /etunimi/i,
    TEST_CONTACT_DETAILS.firstName,
  );
  onContactRequestPage.fillFieldByLabel(
    /sukunimi/i,
    TEST_CONTACT_DETAILS.lastName,
  );
  onContactRequestPage.fillFieldByLabel(
    /sähköposti/i,
    TEST_CONTACT_DETAILS.email,
  );

  onContactRequestPage.isNextEnabled();
};

export const writeMessageStep = () => {
  onContactRequestPage.next();
  onContactRequestPage.isNextDisabled();

  onContactRequestPage.fillMessage(TEST_MESSAGE);

  onContactRequestPage.isNextEnabled();
};

const assertContactDetails = () => {
  onContactRequestPage.expectContactDetailText(
    'firstName',
    TEST_CONTACT_DETAILS.firstName,
  );
  onContactRequestPage.expectContactDetailText(
    'lastName',
    TEST_CONTACT_DETAILS.lastName,
  );
  onContactRequestPage.expectContactDetailText(
    'email',
    TEST_CONTACT_DETAILS.email,
  );
};

export const previewAndSendStep = () => {
  onContactRequestPage.next();
  onContactRequestPage.confirmPrivacyStatement();

  assertContactDetails();
};

export const expectTextForId = (id: Matcher, text: string) =>
  cy.findByTestId(id).should('have.text', text);
