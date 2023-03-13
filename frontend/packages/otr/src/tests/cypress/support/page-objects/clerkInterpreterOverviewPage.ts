import { AppRoutes, UIMode } from 'enums/app';
import { qualificationFields } from 'tests/cypress/fixtures/utils/qualificationFields';

class ClerkInterpreterOverviewPage {
  elements = {
    addQualificationButton: () =>
      cy.findByTestId(
        'clerk-interpreter-overview__qualification-details__add-button'
      ),
    backButton: () => cy.findByTestId('back-button'),
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
    qualificationField: (field: string, fieldType: string) =>
      cy.findByTestId(`qualification-field-${field}`).find(`div>${fieldType}`),
    permissionToPublishSwitch: () =>
      cy.findByTestId('qualification-field-permissionToPublish'),
    qualificationRow: (id: number) =>
      cy.findByTestId(`qualifications-table__id-${id}-row`),
    saveQualificationButton: () => cy.findByTestId('qualification-modal__save'),
    title: () => cy.findByTestId('clerk-interpreter__basic-information__title'),
  };

  navigateById(id: number) {
    cy.visit(
      AppRoutes.ClerkInterpreterOverviewPage.replace(/:interpreterId$/, `${id}`)
    );
  }

  clickBackButton() {
    this.elements.backButton().should('be.visible').click();
  }

  expectTitle(text: string) {
    this.elements.title().should('contain.text', text);
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

  fillOutQualificationField(
    fieldName: string,
    fieldType: string,
    newValue: string
  ) {
    this.elements
      .qualificationField(fieldName, fieldType)
      .clear()
      .type(`${newValue}{enter}`);
  }

  fillOutQualificationFields(fields = qualificationFields) {
    fields.forEach(({ fieldName, fieldType, value }) => {
      onClerkInterpreterOverviewPage.fillOutQualificationField(
        fieldName,
        fieldType,
        value
      );
    });
  }

  toggleQualificationPermissionToPublishSwitch() {
    this.elements.permissionToPublishSwitch().click();
  }

  expectDisabledAddQualificationField(fieldName: string, fieldType: string) {
    this.elements
      .qualificationField(fieldName, fieldType)
      .should('be.disabled');
  }

  clickSaveQualification() {
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

  expectEnabledSaveInterpreterDetailsButton() {
    this.elements.saveInterpreterDetailsButton().should('be.enabled');
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
    }
  }

  expectText(text: string) {
    cy.findByText(text).should('be.visible');
  }
}

export const onClerkInterpreterOverviewPage =
  new ClerkInterpreterOverviewPage();
