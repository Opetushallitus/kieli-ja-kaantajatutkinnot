import { AppRoutes, UIMode } from 'enums/app';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { addQualificationFields } from 'tests/cypress/fixtures/utils/clerkInterpreterOverview';
import { onToast } from 'tests/cypress/support/page-objects/toast';

class ClerkInterpreterOverviewPage {
  elements = {
    addQualificationButton: () =>
      cy.findByTestId(
        'clerk-interpreter-overview__qualification-details__add-button'
      ),
    backToRegisterButton: () =>
      cy.findByTestId('clerk-interpreter-overview-page__back-button'),
    editInterpreterDetailsButton: () =>
      cy.findByTestId(
        'clerk-interpreter-overview__interpreter-details__edit-button'
      ),
    cancelInterpreterDetailsButton: () =>
      cy.findByTestId(
        'clerk-interpreter-overview__interpreter-details__cancel-button'
      ),
    saveInterpreterDetailsButton: () =>
      cy.findByTestId(
        'clerk-interpreter-overview__interpreter-details__save-button'
      ),
    contentContainer: () =>
      cy.get('.clerk-interpreter-overview-page__content-container'),
    interpreterDetailsField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-interpreter__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    addQualificationField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`add-qualification-field-${field}`)
        .find(`div>${fieldType}`),

    permissionToPublishSwitch: () =>
      cy.findByTestId('add-qualification-field-permissionToPublish'),

    qualificationRow: (id: number) =>
      cy.findByTestId(`qualifications-table__id-${id}-row`),

    saveQualificationButton: () =>
      cy.findByTestId('add-qualification-modal__save'),
    cancelQualificationButton: () =>
      cy.findByTestId('add-qualification-modal__cancel'),
  };

  navigateById(id: number) {
    cy.visit(
      AppRoutes.ClerkInterpreterOverviewPage.replace(/:interpreterId$/, `${id}`)
    );
  }

  navigateBackToRegister() {
    this.elements.backToRegisterButton().should('be.visible').click();
  }

  clickEditInterpreterDetailsButton() {
    this.elements.editInterpreterDetailsButton().should('be.visible').click();
  }

  clickAddQualificationButton() {
    this.elements.addQualificationButton().should('be.visible').click();
  }

  clickCancelInterpreterDetailsButton() {
    this.elements.cancelInterpreterDetailsButton().should('be.visible').click();
  }

  clickSaveInterpreterDetailsButton() {
    this.elements.saveInterpreterDetailsButton().should('be.visible').click();
  }

  editInterpreterField(fieldName: string, fieldType: string, newValue) {
    this.elements
      .interpreterDetailsField(fieldName, fieldType)
      .clear()
      .should('have.text', '')
      .type(newValue);
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
      onClerkInterpreterOverviewPage.fillOutAddQualificationField(
        fieldName,
        fieldType,
        value
      );
    });
  }

  toggleAddQualificationPermissionToPublishSwitch() {
    this.elements.permissionToPublishSwitch().click();
  }

  expectDisabledAddQualificationField(fieldName: string, fieldType: string) {
    this.elements
      .addQualificationField(fieldName, fieldType)
      .should('be.disabled');
  }

  expectEnabledAddQualificationField(fieldName: string, fieldType: string) {
    this.elements
      .addQualificationField(fieldName, fieldType)
      .should('be.enabled');
  }

  saveQualification() {
    this.elements.saveQualificationButton().should('be.visible').click();
  }

  expectSaveButtonDisabled() {
    this.elements.saveQualificationButton().should('be.disabled');
  }

  expectSaveButtonEnabled() {
    this.elements.saveQualificationButton().should('be.enabled');
  }

  expectQualificationRowToExist(id: number) {
    this.elements.qualificationRow(id).should('be.visible');
  }

  cancelQualification() {
    this.elements.cancelQualificationButton().should('be.visible').click();
  }

  expectInterpreterDetailsFieldValue(
    field: string,
    fieldType: string,
    value: string
  ) {
    this.elements
      .interpreterDetailsField(field, fieldType)
      .should('have.value', value);
  }

  expectDisabledInterpreterDetailsField(field: string, fieldType: string) {
    this.elements
      .interpreterDetailsField(field, fieldType)
      .should('be.disabled');
  }

  expectEnabledEditInterpreterDetailsButton() {
    this.elements.editInterpreterDetailsButton().should('be.enabled');
  }

  expectDisabledSaveInterpreterDetailsButton() {
    this.elements
      .saveInterpreterDetailsButton()
      .should('be.visible')
      .should('be.disabled');
  }

  expectedEnabledAddQualificationButton() {
    this.elements.addQualificationButton().should('be.enabled');
  }

  expectInterpreterNotFoundText() {
    onToast.expectText('Valittua kääntäjää ei löytynyt');
  }

  expectMode(mode: UIMode) {
    switch (mode) {
      case UIMode.View:
        this.elements.addQualificationButton().should('be.visible');
        this.elements.editInterpreterDetailsButton().should('be.visible');
        break;
      case UIMode.EditInterpreterDetails:
        this.elements.cancelInterpreterDetailsButton().should('be.visible');
        break;
      case UIMode.EditQualificationDetails:
        // not implemented yet
        assert(false);
    }
  }

  expectText(text: string) {
    cy.findByText(text).should('be.visible');
  }

  expectInterpreterDetailsFields(translator: ClerkInterpreterResponse) {
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

      onClerkInterpreterOverviewPage.expectInterpreterDetailsFieldValue(
        field,
        fieldType,
        expectedValue
      );
      onClerkInterpreterOverviewPage.expectDisabledInterpreterDetailsField(
        field,
        fieldType
      );
    });
  }
}

export const onClerkInterpreterOverviewPage =
  new ClerkInterpreterOverviewPage();
