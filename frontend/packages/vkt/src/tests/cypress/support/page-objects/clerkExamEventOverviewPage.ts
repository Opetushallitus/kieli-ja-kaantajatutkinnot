import { EnrollmentStatus, UIMode } from 'enums/app';

const enrollmentRowTestId = (id: number) => `enrollments-table__id-${id}-row`;

class ClerkExamEventOverviewPage {
  elements = {
    backToRegisterButton: () =>
      cy.findByTestId('clerk-exam-event-overview-page__back-button'),
    editDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__edit-button',
      ),
    cancelExamEventDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__cancel-button',
      ),
    saveExamEventDetailsButton: () =>
      cy.findByTestId(
        'clerk-exam-event-overview__exam-event-details__save-button',
      ),
    enrollmentRow: (id: number) => cy.findByTestId(enrollmentRowTestId(id)),
    datePicker: (fieldName: string) =>
      cy
        .findByTestId(`clerk-exam-event__basic-information__${fieldName}`)
        .find('.custom-date-picker input'),
    examEventDetailsField: (field: string, fieldType: string) =>
      cy
        .findByTestId(`clerk-exam-event__basic-information__${field}`)
        .should('be.visible')
        .find(`div>${fieldType}`),
    header: () => cy.findByTestId('clerk-exam-event-overview-page__header'),
    enrollmentListHeader: (status: EnrollmentStatus) =>
      cy.findByTestId(
        `clerk-exam-event-overview-page__enrollment-list-${status}__header`,
      ),
    changeEnrollmentStatusButton: (id: number) =>
      cy.findByTestId(
        `clerk-exam-event-overview__enrollment-list-${id}__change-status-button`,
      ),
    copyEmailsButton: () =>
      cy.findByTestId('clerk-exam-event-overview-page__copy-emails-button'),
    copyEmailsOpenMenuButton: () =>
      cy
        .findByTestId('clerk-exam-event-overview-page__copy-emails-button')
        .find('[aria-haspopup="menu"]'),
    copyEmailsMenuItemButton: (index: number) =>
      cy.findByTestId(`split-button-option-${index}`),
  };

  expectEnrollmentRowToHaveText(id: number, text: string) {
    this.elements.enrollmentRow(id).should('contain.text', text);
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

  clickEnrollmentRow(id: number) {
    this.elements.enrollmentRow(id).should('be.visible').click();
  }

  editExamEventDateField(fieldName: string, newValue: string) {
    this.elements.datePicker(fieldName).should('be.visible').clear();
    this.elements.datePicker(fieldName).type(`${newValue}{enter}`);
  }

  clearExamEventField(fieldName: string, fieldType: string) {
    this.elements
      .examEventDetailsField(fieldName, fieldType)
      .clear()
      .should('have.text', '');
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

  expectEnrollmentListHeaderNotToExist(status: EnrollmentStatus) {
    this.elements.enrollmentListHeader(status).should('not.exist');
  }

  expectEnrollmentListHeaderToHaveText(status: EnrollmentStatus, text: string) {
    this.elements.enrollmentListHeader(status).should('contain.text', text);
  }

  expectEnrollmentStatusChangeButtonToHaveText(id: number, text: string) {
    this.elements.changeEnrollmentStatusButton(id).should('contain.text', text);
  }

  clickChangeEnrollmentStatusButton(id: number) {
    this.elements.changeEnrollmentStatusButton(id).should('be.visible').click();
  }

  clickCopyEmailsButton() {
    this.elements.copyEmailsButton().should('be.visible').click();
  }

  clickCopyEmailsOpenMenuButton() {
    this.elements.copyEmailsOpenMenuButton().should('be.visible').click();
  }

  clickCopyEmailsMenuItem(index: number) {
    this.elements.copyEmailsMenuItemButton(index).should('be.visible').click();
  }

  expectClipboardToHaveText(text: string) {
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((clipText) => {
        expect(clipText).to.eq(text);
      });
    });
  }
}

export const onClerkExamEventOverviewPage = new ClerkExamEventOverviewPage();
