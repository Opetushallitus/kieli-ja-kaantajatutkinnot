import { AppRoutes, UIMode } from 'enums/app';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { addAuthorisationFields } from 'tests/cypress/fixtures/utils/clerkTranslatorOverview';
import { onToast } from 'tests/cypress/support/page-objects/toast';

class ClerkTranslatorOverviewPage {
  elements = {
    addAuthorisationBtn: () =>
      cy.findByTestId(
        'clerk-translator-overview__authorisation-details__add-btn'
      ),
    backToRegisterBtn: () =>
      cy.findByTestId('clerk-translator-overview-page__back-btn'),
    editTranslatorInfoBtn: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__edit-btn'
      ),
    cancelTranslatorInfoBtn: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__cancel-btn'
      ),
    saveTranslatorInfoBtn: () =>
      cy.findByTestId(
        'clerk-translator-overview__translator-details__save-btn'
      ),
    contentContainer: () =>
      cy.get('.clerk-translator-overview-page__content-container'),
    translatorDetailsField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-translator__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    addAuthorisationField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`add-authorisation-field-${field}`)
        .find(`div>${fieldType}`),

    permissionToPublishSwitch: () =>
      cy.findByTestId('add-authorisation-field-permissionToPublish'),

    authorisationRow: (id: number) =>
      cy.findByTestId(`authorisations-table__id-${id}-row`),

    saveAuthorisationBtn: () =>
      cy.findByTestId('add-authorisation-modal__save'),
    cancelAuthorisationBtn: () =>
      cy.findByTestId('add-authorisation-modal__cancel'),
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

  clickEditTranslatorInfoBtn() {
    this.elements.editTranslatorInfoBtn().should('be.visible').click();
  }

  clickAddAuthorisationBtn() {
    this.elements.addAuthorisationBtn().should('be.visible').click();
  }

  clickCancelTranslatorInfoBtn() {
    this.elements.cancelTranslatorInfoBtn().should('be.visible').click();
  }

  clickSaveTranslatorInfoBtn() {
    this.elements.saveTranslatorInfoBtn().should('be.visible').click();
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

  fillOutAddAuthorisationField(
    fieldName: string,
    fieldType: string,
    newValue: string
  ) {
    this.elements
      .addAuthorisationField(fieldName, fieldType)
      .clear()
      .type(`${newValue}{enter}`);
  }

  fillOutAddAuthorisationFields(fields = addAuthorisationFields) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      onClerkTranslatorOverviewPage.fillOutAddAuthorisationField(
        fieldName,
        fieldType,
        value
      );
    });
  }

  toggleAddAuthorisationPermissionToPublishSwitch() {
    this.elements.permissionToPublishSwitch().click();
  }

  expectDisabledAddAuthorisationField(fieldName: string, fieldType: string) {
    this.elements
      .addAuthorisationField(fieldName, fieldType)
      .should('be.disabled');
  }

  expectEnabledAddAuthorisationField(fieldName: string, fieldType: string) {
    this.elements
      .addAuthorisationField(fieldName, fieldType)
      .should('be.enabled');
  }

  saveAuthorisation() {
    this.elements.saveAuthorisationBtn().should('be.visible').click();
  }

  expectSaveButtonDisabled() {
    this.elements.saveAuthorisationBtn().should('be.disabled');
  }

  expectSaveButtonEnabled() {
    this.elements.saveAuthorisationBtn().should('be.enabled');
  }

  expectAuthorisationRowToExist(id: number) {
    this.elements.authorisationRow(id).should('be.visible');
  }

  cancelAuthorisation() {
    this.elements.cancelAuthorisationBtn().should('be.visible').click();
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

  expectEnabledEditTranslatorInfoBtn() {
    this.elements.editTranslatorInfoBtn().should('be.enabled');
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
        this.elements.editTranslatorInfoBtn().should('be.visible');
        break;
      case UIMode.EditTranslatorDetails:
        this.elements.cancelTranslatorInfoBtn().should('be.visible');
        break;
      case UIMode.EditAuthorisationDetails:
        // not implemented yet
        assert(false);
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
