class ClerkSendEmailPage {
  elements = {
    cancelButton: () => cy.findByTestId('clerk-send-email-page__cancel-btn'),
    sendButton: () => cy.findByTestId('clerk-send-email-page__send-btn'),
    subject: () => cy.findByTestId('clerk-send-email-page__subject'),
    message: () => cy.findByTestId('clerk-send-email-page__message'),
  };

  writeSubject(subject: string) {
    this.elements.subject().type(subject);
  }

  writeMessage(message: string) {
    this.elements.message().type(message);
  }

  cancel() {
    this.elements.cancelButton().click();
  }

  send() {
    this.elements.sendButton().click();
  }

  expectSendDisabled() {
    this.elements.sendButton().should('be.disabled');
  }

  expectSendEnabled() {
    this.elements.sendButton().should('be.enabled');
  }
}

export const onClerkSendEmailPage = new ClerkSendEmailPage();

export const TEST_SUBJECT = 'Testiotsikko';
export const TEST_MESSAGE = 'Testiviesti';
