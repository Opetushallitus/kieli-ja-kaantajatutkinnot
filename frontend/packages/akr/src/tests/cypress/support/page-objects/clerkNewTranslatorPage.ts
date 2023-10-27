import { authorisationFields } from 'tests/cypress/fixtures/utils/authorisationFields';
import { newTranslatorBasicInformationFields } from 'tests/cypress/fixtures/utils/clerkNewTranslator';

class ClerkNewTranslatorPage {
  elements = {
    socialSecurityNumberField: () =>
      cy.findByTestId('clerk-person-search-page__ssn__field'),
    socialSecurityNumberSearchButton: () =>
      cy.findByTestId('clerk-person-search-page__ssn__search-button'),
    proceedButton: () =>
      cy.findByTestId('clerk-person-search-page__proceed-button'),
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
    authorisationField: (
      field: string,
      fieldType: string,
      isDatePicker = false
    ) =>
      cy
        .findByTestId(
          `authorisation-field-${field}${isDatePicker ? '__date-picker' : ''}`
        )
        .find(`div>${fieldType}`),
    addAuthorisationButton: () =>
      cy.findByTestId('clerk-new-translator-page__add-authorisation-button'),
    authorisationSaveButton: () => cy.findByTestId('authorisation-modal__save'),
    deleteAuthorisationButton: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-row__delete-btn`),
    deleteAuthorisationDialogConfirmButton: () =>
      cy.findByTestId(
        'clerk-new-translator-page__dialog-confirm-remove-button'
      ),
    saveNewClerkButton: () =>
      cy.findByTestId('clerk-new-translator-page__save-button'),
    authorisationRow: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-row`),
    authorisationsTable: () =>
      cy.findByTestId('clerk-translator-details__authorisations-table'),
  };

  typeSocialSecurityNumber(socialSecurityNumber: string) {
    this.elements
      .socialSecurityNumberField()
      .should('be.visible')
      .type(socialSecurityNumber);
  }

  clickSearchButton() {
    this.elements
      .socialSecurityNumberSearchButton()
      .should('be.visible')
      .click();
  }

  clickProceedButton() {
    this.elements.proceedButton().should('be.visible').click();
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
      .authorisationField(fieldName, fieldType)
      .clear()
      .type(`${value}{enter}`);
  }

  clickNewTranslatorAssuranceSwitch() {
    this.elements.newTranslatorAssuranceSwitch().should('be.visible').click();
  }

  clickAddAuthorisationButton() {
    this.elements.addAuthorisationButton().click();
  }

  clickAuthorisationSaveButton() {
    this.elements.authorisationSaveButton().should('be.visible').click();
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

  expectSaveNewClerkButtonDisabled() {
    this.elements.saveNewClerkButton().should('be.disabled');
  }

  expectSaveNewClerkButtonEnabled() {
    this.elements.saveNewClerkButton().should('be.enabled');
  }

  expectAuthorisationRowToExist(id: number) {
    this.elements.authorisationRow(id).should('exist');
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

  fillOutAuthorisationFields(fields = authorisationFields) {
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
