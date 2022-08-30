import { AppRoutes, UIMode } from 'enums/app';
import { addQualificationFields } from 'tests/cypress/fixtures/utils/clerkInterpreterOverview';

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

  expectEnabledInterpreterField(fieldName, fieldType) {
    this.elements
      .interpreterDetailsField(fieldName, fieldType)
      .should('be.enabled');
  }

  expectDisabledInterpreterField(fieldName, fieldType) {
    this.elements
      .interpreterDetailsField(fieldName, fieldType)
      .should('be.disabled');
  }

  expectInterpreterFieldValue(field: string, fieldType: string, value: string) {
    this.elements
      .interpreterDetailsField(field, fieldType)
      .should('have.value', value);
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

  saveQualification() {
    this.elements.saveQualificationButton().should('be.visible').click();
  }

  expectQualificationSaveButtonDisabled() {
    this.elements.saveQualificationButton().should('be.disabled');
  }

  expectQualificationSaveButtonEnabled() {
    this.elements.saveQualificationButton().should('be.enabled');
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
}

export const onClerkInterpreterOverviewPage =
  new ClerkInterpreterOverviewPage();
