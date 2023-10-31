import { AppRoutes, UIMode } from 'enums/app';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { authorisationFields } from 'tests/cypress/fixtures/utils/authorisationFields';
import { onToast } from 'tests/cypress/support/page-objects/toast';

class ClerkTranslatorOverviewPage {
  elements = {
    addAuthorisationBtn: () =>
      cy.findByTestId(
        'clerk-translator-overview__authorisation-details__add-btn'
      ),
    backToRegisterBtn: () =>
      cy.findByTestId('clerk-translator-overview-page__back-btn'),
    editTranslatorDetailsButton: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__edit-btn'
      ),
    cancelTranslatorDetailsButton: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__cancel-btn'
      ),
    saveTranslatorDetailsButton: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__save-btn'
      ),
    translatorDetailsField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-translator__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    authorisationField: (field: string, fieldType: string) =>
      cy.findByTestId(`authorisation-field-${field}`).find(`div>${fieldType}`),
    permissionToPublishSwitch: () =>
      cy.findByTestId('authorisation-field-permissionToPublish'),
    authorisationRow: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-row`),
    authorisationSaveButton: () => cy.findByTestId('authorisation-modal__save'),
    assuranceSwitch: () =>
      cy.findByTestId('clerk-translator__basic-information__assurance-switch'),
    assuranceSwitchErrorLabel: () =>
      cy.findByTestId(
        'clerk-translator__basic-information__assurance-switch__error-label'
      ),
  };

  navigateById(id: number) {
    cy.visit(
      AppRoutes.ClerkTranslatorOverviewPage.replace(/:translatorId$/, `${id}`)
    );
  }

  navigateBackToRegister() {
    this.elements.backToRegisterBtn().should('be.visible').click();
  }

  clickEditTranslatorDetailsButton() {
    this.elements.editTranslatorDetailsButton().should('be.visible').click();
  }

  clickAddAuthorisationBtn() {
    this.elements.addAuthorisationBtn().should('be.visible').click();
  }

  clickCancelTranslatorDetailsButton() {
    this.elements.cancelTranslatorDetailsButton().should('be.visible').click();
  }

  clickSaveTranslatorDetailsButton() {
    this.elements.saveTranslatorDetailsButton().should('be.visible').click();
  }

  editTranslatorField(fieldName: string, fieldType: string, newValue) {
    this.elements
      .translatorDetailsField(fieldName, fieldType)
      .clear()
      .should('have.text', '')
      .type(newValue);
  }

  toggleAssuranceSwitch() {
    this.elements.assuranceSwitch().should('be.visible').click();
  }

  expectAssuranceErrorLabel(assert: string) {
    this.elements.assuranceSwitchErrorLabel().should(assert);
  }

  fillOutAuthorisationField(
    fieldName: string,
    fieldType: string,
    newValue: string
  ) {
    this.elements
      .authorisationField(fieldName, fieldType)
      .clear()
      .type(`${newValue}{enter}`);
  }

  fillOutAuthorisationFields(fields = authorisationFields) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      onClerkTranslatorOverviewPage.fillOutAuthorisationField(
        fieldName,
        fieldType,
        value
      );
    });
  }

  toggleAddAuthorisationPermissionToPublishSwitch() {
    this.elements.permissionToPublishSwitch().click();
  }

  expectDisabledAuthorisationField(fieldName: string, fieldType: string) {
    this.elements
      .authorisationField(fieldName, fieldType)
      .should('be.disabled');
  }

  expectEnabledAuthorisationField(fieldName: string, fieldType: string) {
    this.elements.authorisationField(fieldName, fieldType).should('be.enabled');
  }

  saveAuthorisation() {
    this.elements.authorisationSaveButton().should('be.visible').click();
  }

  expectSaveAuthorisationButtonDisabled() {
    this.elements.authorisationSaveButton().should('be.disabled');
  }

  expectSaveAuthorisationButtonEnabled() {
    this.elements.authorisationSaveButton().should('be.enabled');
  }

  expectAuthorisationRowToExist(id: number) {
    this.elements.authorisationRow(id).should('be.visible');
  }

  expectTranslatorDetailsFieldValue(
    field: string,
    fieldType: string,
    value: string
  ) {
    this.elements
      .translatorDetailsField(field, fieldType)
      .should('have.value', value);
  }

  expectDisabledTranslatorDetailsField(field: string, fieldType: string) {
    this.elements
      .translatorDetailsField(field, fieldType)
      .should('be.disabled');
  }

  expectEnabledEditTranslatorDetailsButton() {
    this.elements.editTranslatorDetailsButton().should('be.enabled');
  }

  expectDisabledSaveTranslatorDetailsButton() {
    this.elements
      .saveTranslatorDetailsButton()
      .should('be.visible')
      .should('be.disabled');
  }

  expectEnabledSaveTranslatorDetailsButton() {
    this.elements.saveTranslatorDetailsButton().should('be.enabled');
  }

  expectedEnabledAddAuthorisationButton() {
    this.elements.addAuthorisationBtn().should('be.enabled');
  }

  expectTranslatorNotFoundText() {
    onToast.expectText('Valittua kääntäjää ei löytynyt');
  }

  expectMode(mode: UIMode) {
    switch (mode) {
      case UIMode.View:
        this.elements.addAuthorisationBtn().should('be.visible');
        this.elements.editTranslatorDetailsButton().should('be.visible');
        break;
      case UIMode.EditTranslatorDetails:
        this.elements.cancelTranslatorDetailsButton().should('be.visible');
        break;
    }
  }

  expectText(text: string) {
    cy.findByText(text).should('be.visible');
  }

  expectTranslatorDetailsFields(translator: ClerkTranslatorResponse) {
    const fields = [
      { field: 'firstName', fieldType: 'input' },
      { field: 'lastName', fieldType: 'input' },
      { field: 'identityNumber', fieldType: 'input' },
      { field: 'email', fieldType: 'input' },
      { field: 'phoneNumber', fieldType: 'input' },
      { field: 'street', fieldType: 'input' },
      { field: 'postalCode', fieldType: 'input' },
      { field: 'town', fieldType: 'input' },
      { field: 'country', fieldType: 'input' },
      { field: 'extraInformation', fieldType: 'textarea' },
    ];

    fields.forEach(({ field, fieldType }) => {
      const expectedValue = translator[field] ? translator[field] : '';

      onClerkTranslatorOverviewPage.expectTranslatorDetailsFieldValue(
        field,
        fieldType,
        expectedValue
      );
      onClerkTranslatorOverviewPage.expectDisabledTranslatorDetailsField(
        field,
        fieldType
      );
    });
  }
}

export const onClerkTranslatorOverviewPage = new ClerkTranslatorOverviewPage();
