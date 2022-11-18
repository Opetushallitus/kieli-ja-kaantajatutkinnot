import { AppRoutes, UIMode } from 'enums/app';

const enrollmentRowTestId = (id: number) => `enrollments-table__id-${id}-row`;

class ClerkExamEventOverviewPage {
  elements = {
    backToRegisterButton: () =>
      cy.findByTestId('clerk-exam-event-overview-page__back-button'),
    editDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__edit-button'
      ),
    cancelExamEventDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__cancel-button'
      ),
    saveExamEventDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__save-button'
      ),
    enrollmentRow: (id: number) => cy.findByTestId(enrollmentRowTestId(id)),
    datePicker: (fieldName: string) =>
      cy
        .findByTestId(`clerk-exam-event__basic-information__${fieldName}`)
        .find('.custom-date-picker'),
    examEventDetailsField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-exam-event__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    header: () => cy.findByTestId('clerk-exam-event-overview-page__header'),
  };

  expectEnrollmentRowToHaveText(id: number, text: string) {
    this.elements.enrollmentRow(id).should('contain.text', text);
  }

  navigateById(id: number) {
    cy.visit(
      AppRoutes.ClerkExamEventOverviewPage.replace(/:examEventId$/, `${id}`)
    );
  }

  navigateBackToRegister() {
    this.elements.backToRegisterButton().should('be.visible').click();
  }

  expectPageHeader(text: string) {
    this.elements.header().should('contain.text', text);
  }

  clickEditExamEventDetailsButton() {
    this.elements.editDetailsButton().should('be.visible').click();
  }

  clickCancelExamEventDetailsButton() {
    this.elements.cancelExamEventDetailsButton().should('be.visible').click();
  }

  clickSaveExamEventDetailsButton() {
    this.elements.saveExamEventDetailsButton().should('be.visible').click();
  }

  editExamEventDateField(fieldName: string, newValue: string) {
    this.elements
      .datePicker(fieldName)
      .should('be.visible')
      .clear()
      .type(`${newValue}{enter}`);
  }

  editExamEventField(fieldName: string, fieldType: string, newValue) {
    this.elements
      .examEventDetailsField(fieldName, fieldType)
      .clear()
      .should('have.text', '')
      .type(`${newValue}{enter}`);
  }

  expectExamEventFieldValue(field: string, fieldType: string, value: string) {
    this.elements
      .examEventDetailsField(field, fieldType)
      .should('have.value', value);
  }

  expectDisabledSaveExamEventDetailsButton() {
    this.elements
      .saveExamEventDetailsButton()
      .should('be.visible')
      .should('be.disabled');
  }

  expectEnabledSaveExamEventDetailsButton() {
    this.elements.saveExamEventDetailsButton().should('be.enabled');
  }

  expectMode(mode: UIMode) {
    switch (mode) {
      case UIMode.View:
        this.elements.editDetailsButton().should('be.visible');
        break;
      case UIMode.Edit:
        this.elements.cancelExamEventDetailsButton().should('be.visible');
        break;
    }
  }
}

export const onClerkExamEventOverviewPage = new ClerkExamEventOverviewPage();
