import { addQualificationFields } from 'tests/cypress/fixtures/utils/clerkInterpreterOverview';

class ClerkNewInterpreterPage {
  elements = {
    addQualificationButton: () =>
      cy.findByTestId('clerk-new-interpreter-page__add-qualification-button'),
    backToRegisterButton: () =>
      cy.findByTestId('clerk-interpreter-overview-page__back-button'),
    interpreterField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-interpreter__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    addQualificationField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`add-qualification-field-${field}`)
        .find(`div>${fieldType}`),
    qualificationRow: (i: number) =>
      cy.findByTestId(`qualifications-table__id-${i}-unsaved`),
    saveQualificationButton: () =>
      cy.findByTestId('add-qualification-modal__save'),
    saveInterpreterButton: () =>
      cy.findByTestId('clerk-new-interpreter-page__save-button'),
  };

  editInterpreterField(fieldName: string, fieldType: string, newValue) {
    this.elements
      .interpreterField(fieldName, fieldType)
      .clear()
      .should('have.text', '')
      .type(newValue);
  }

  setNameFieldValues(lastName: string, firstName: string, nickName: string) {
    this.editInterpreterField('lastName', 'input', lastName);
    this.editInterpreterField('firstName', 'input', firstName);
    this.editInterpreterField('nickName', 'input', nickName);
  }

  expectNameFieldValues(lastName: string, firstName: string, nickName: string) {
    this.expectInterpreterFieldValue('lastName', 'input', lastName);
    this.expectInterpreterFieldValue('firstName', 'input', firstName);
    this.expectInterpreterFieldValue('nickName', 'input', nickName);
  }

  expectAddressFieldValues(
    street: string,
    postalCode: string,
    town: string,
    country: string
  ) {
    this.expectInterpreterFieldValue('street', 'input', street);
    this.expectInterpreterFieldValue('postalCode', 'input', postalCode);
    this.expectInterpreterFieldValue('town', 'input', town);
    this.expectInterpreterFieldValue('country', 'input', country);
  }

  expectEnabledInterpreterField(fieldName, fieldType) {
    this.elements.interpreterField(fieldName, fieldType).should('be.enabled');
  }

  expectDisabledInterpreterField(fieldName, fieldType) {
    this.elements.interpreterField(fieldName, fieldType).should('be.disabled');
  }

  expectInterpreterFieldValue(field: string, fieldType: string, value: string) {
    this.elements
      .interpreterField(field, fieldType)
      .should('have.value', value);
  }

  clickAddQualificationButton() {
    this.elements.addQualificationButton().should('be.visible').click();
  }

  fillOutAddQualificationField(
    fieldName: string,
    fieldType: string,
    newValue: string
  ) {
    this.elements
      .addQualificationField(fieldName, fieldType)
      .clear()
      .type(`${newValue}{enter}`);
  }

  fillOutAddQualificationFields(fields = addQualificationFields) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      this.fillOutAddQualificationField(fieldName, fieldType, value);
    });
  }

  clickSaveQualificationButton() {
    this.elements.saveQualificationButton().should('be.visible').click();
  }

  clickSaveInterpreterButton() {
    this.elements.saveInterpreterButton().should('be.visible').click();
  }

  expectEnabledSaveInterpreterButton() {
    this.elements.saveInterpreterButton().should('be.enabled');
  }

  expectDisabledSaveInterpreterButton() {
    this.elements.saveInterpreterButton().should('be.disabled');
  }
}

export const onClerkNewInterpreterPage = new ClerkNewInterpreterPage();
