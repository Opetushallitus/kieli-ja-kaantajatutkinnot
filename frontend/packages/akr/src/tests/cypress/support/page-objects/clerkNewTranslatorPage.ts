import {
  addAuthorisationFields,
  newTranslatorBasicInformationFields,
} from 'tests/cypress/fixtures/utils/clerkNewTranslator';

class ClerkNewTranslatorPage {
  elements = {
    addNewTranslatorButton: () =>
      cy.findByTestId('clerk-translator-registry__add-new-translator'),
    newTranslatorBasicInformationField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-translator__basic-information__${field}`)
        .find(`div>${fieldType}`),
    newTranslatorBasicInformationExtraInformation: () =>
      cy.findByTestId(`clerk-translator__basic-information__extraInformation`),

    newTranslatorAssuranceSwitch: () =>
      cy.findByTestId('clerk-translator__basic-information__assurance-switch'),
    addAuthorisationField: (
      field: string,
      fieldType: string,
      isDatePicker = false
    ) =>
      cy
        .findByTestId(
          `add-authorisation-field-${field}${
            isDatePicker ? '__date-picker' : ''
          }`
        )
        .find(`div>${fieldType}`),
    addAuthorisationButton: () =>
      cy.findByTestId('clerk-new-translator-page__add-authorisation-button'),
    addAuthorisationModalAddButton: () =>
      cy.findByTestId('add-authorisation-modal__save'),
    deleteAuthorisationButton: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-row__delete-btn`),
    deleteAuthorisationDialogConfirmButton: () =>
      cy.findByTestId(
        'clerk-new-translator-page__dialog-confirm-remove-button'
      ),
    saveNewClerkButton: () =>
      cy.findByTestId('clerk-new-translator-page__save-button'),
    authorisationRow: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-unsaved-row`),
    authorisationsTable: () =>
      cy.findByTestId('clerk-translator-details__authorisations-table'),
  };

  expectSelectedTranslatorsCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  clickAddNewTranslatorButton() {
    this.elements.addNewTranslatorButton().click();
  }

  fillOutNewTranslatorBasicInformationField(
    fieldName: string,
    fieldType: string,
    value: string
  ) {
    this.elements
      .newTranslatorBasicInformationField(fieldName, fieldType)
      .clear()
      .should('have.text', '')
      .type(`${value}{enter}`);
  }

  fillOutNewTranslatorBasicInformationExtraInformation(newValue) {
    this.elements
      .newTranslatorBasicInformationExtraInformation()
      .type(newValue);
  }

  fillOutAddAuthorisationField(
    fieldName: string,
    fieldType: string,
    value: string
  ) {
    this.elements
      .addAuthorisationField(fieldName, fieldType)
      .clear()
      .type(`${value}{enter}`);
  }

  clickNewTranslatorAssuranceSwitch() {
    this.elements.newTranslatorAssuranceSwitch().should('be.visible').click();
  }

  clickAddAuthorisationButton() {
    this.elements.addAuthorisationButton().click();
  }

  addAuthorisation() {
    this.elements.addAuthorisationModalAddButton().should('be.visible').click();
  }

  clickSaveNewClerkButton() {
    this.elements.saveNewClerkButton().should('be.visible').click();
  }

  clickDeleteAuthorisationButton(id: number) {
    this.elements.deleteAuthorisationButton(id).should('be.visible').click();
  }

  clickDeleteAuthorisationDialogConfirmButton() {
    this.elements
      .deleteAuthorisationDialogConfirmButton()
      .should('be.visible')
      .click();
  }

  clickDeleteUnsavedAuthorisationButton(id: number) {
    this.elements.deleteAuthorisationButton(id).should('be.visible').click();
  }

  expectSaveNewClerkButtonDisabled() {
    this.elements.saveNewClerkButton().should('be.disabled');
  }

  expectSaveNewClerkButtonEnabled() {
    this.elements.saveNewClerkButton().should('be.enabled');
  }

  expectUnsavedAuthorisationRowToExist(id: number) {
    this.elements.authorisationRow(id).should('exist');
  }

  expectUnsavedAuthorisationRowToNotExist(id: number) {
    this.elements.authorisationRow(id).should('not.exist');
  }

  expectAuthorisationsTableToNotExist() {
    this.elements.authorisationsTable().should('not.exist');
  }

  fillOutNewTranslatorBasicInformationFields(
    fields = newTranslatorBasicInformationFields
  ) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      onClerkNewTranslatorPage.fillOutNewTranslatorBasicInformationField(
        fieldName,
        fieldType,
        value
      );
    });
  }

  fillOutAddAuthorisationFields(fields = addAuthorisationFields) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      onClerkNewTranslatorPage.fillOutAddAuthorisationField(
        fieldName,
        fieldType,
        value
      );
    });
  }
}

export const onClerkNewTranslatorPage = new ClerkNewTranslatorPage();
