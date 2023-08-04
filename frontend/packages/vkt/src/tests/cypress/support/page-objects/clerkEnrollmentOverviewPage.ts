class ClerkEnrollmentOverviewPage {
  elements = {
    cancelEnrollmentButton: () =>
      cy.findByTestId('clerk-enrollment-details__cancel-enrollment-button'),
    checkboxField: (fieldName: string) =>
      cy
        .findByTestId(`clerk-enrollment__details-fields__${fieldName}`)
        .should('be.visible')
        .find('>input'),
    editButton: () => cy.findByTestId('clerk-enrollment-details__edit-button'),
    saveButton: () => cy.findByTestId('clerk-enrollment-details__save-button'),
    moveButton: () => cy.findByTestId('clerk-enrollment-details__move-button'),
    refundButton: () =>
      cy.findByTestId('clerk-enrollment__details-fields__set-refunded'),
    refundedAt: () =>
      cy.findByTestId('clerk-enrollment__details-fields__refunded-date'),
    textField: (fieldName: string) =>
      cy
        .findByTestId(`clerk-enrollment__details-fields__${fieldName}`)
        .should('be.visible')
        .find('div>input'),
  };

  expectTextFieldValue(fieldName: string, value: string) {
    this.elements.textField(fieldName).should('have.value', value);
  }

  expectTextFieldDisabled(fieldName: string) {
    this.elements.textField(fieldName).should('be.disabled');
  }

  expectTextFieldNotToExist(fieldName: string) {
    cy.get(`clerk-enrollment__details-fields__${fieldName}`).should(
      'not.exist'
    );
  }

  editTextField(fieldName: string, newValue) {
    this.elements
      .textField(fieldName)
      .clear()
      .should('have.text', '')
      .type(`${newValue}{enter}`);
  }

  expectCheckboxFieldDisabled(fieldName: string) {
    this.elements.checkboxField(fieldName).should('be.disabled');
  }

  expectCheckboxFieldChecked(fieldName: string) {
    this.elements.checkboxField(fieldName).should('be.checked');
  }

  expectCheckboxFieldNotChecked(fieldName: string) {
    this.elements.checkboxField(fieldName).should('not.be.checked');
  }

  clickCheckBox(fieldName: string) {
    this.elements.checkboxField(fieldName).click();
  }

  clickEditButton() {
    this.elements.editButton().should('be.visible').click();
  }

  expectDisabledSaveButton() {
    this.elements.saveButton().should('be.disabled');
  }

  expectEnabledSaveButton() {
    this.elements.saveButton().should('be.enabled');
  }

  clickCancelEnrollmentButton() {
    this.elements.cancelEnrollmentButton().should('be.visible').click();
  }

  expectDisabledCancelEnrollmentButton() {
    this.elements.cancelEnrollmentButton().should('be.disabled');
  }

  clickSetRefundedPaymentButton() {
    this.elements.refundButton().should('be.visible').click();
  }

  expectRefundedAtDate(date: string) {
    this.elements.refundedAt().should('be.visible').should('have.text', date);
  }
}

export const onClerkEnrollmentOverviewPage = new ClerkEnrollmentOverviewPage();
