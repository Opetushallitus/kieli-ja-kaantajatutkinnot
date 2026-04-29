import { onAddExamDateModal } from 'tests/cypress/support/page-objects/addExamDateModal';
// toast import not needed since modal does not show success message

describe('AddExamDateModal', () => {
  beforeEach(() => {
    cy.openClerkExamDatesPage();
    cy.findByRole('checkbox', { name: /Näytä menneet päivät/i }).should(
      'exist',
    );
    cy.findByRole('button', { name: 'Lisää tutkintopäivä' }).click();
    onAddExamDateModal.expectModalVisible();
  });

  describe('Modal Display and Structure', () => {
    it('should display modal with all required form fields and buttons', () => {
      onAddExamDateModal.expectAllFormFieldsVisible();
      onAddExamDateModal.expectSubmitButtonVisible();
      onAddExamDateModal.expectCancelButtonVisible();
      cy.get('[data-testid="add-exam-date-modal-close"]').should('be.visible');
    });

    it('should close modal when close button is clicked and not save any changes', () => {
      onAddExamDateModal.enterExamDate('10.05.2026');
      onAddExamDateModal.expectModalVisible();
      onAddExamDateModal.clickCloseButton();
      onAddExamDateModal.expectModalNotExist();
    });
  });

  describe('Language and Level Selection', () => {
    it('should allow selecting multiple language levels for different languages', () => {
      onAddExamDateModal.enterExamDate('10.05.2026');
      onAddExamDateModal.enterRegistrationStartDate('01.04.2026');
      onAddExamDateModal.enterRegistrationEndDate('02.04.2026');

      // Select different levels for different languages
      onAddExamDateModal.selectLanguageLevel('eng', 'PERUS');
      onAddExamDateModal.expectLanguageLevelChecked('eng', 'PERUS');

      onAddExamDateModal.selectLanguageLevel('fra', 'KESKI');
      onAddExamDateModal.expectLanguageLevelChecked('fra', 'KESKI');

      onAddExamDateModal.selectLanguageLevel('deu', 'YLIN');
      onAddExamDateModal.expectLanguageLevelChecked('deu', 'YLIN');

      // Verify other levels remain unchecked
      onAddExamDateModal.expectLanguageLevelNotChecked('eng', 'KESKI');
      onAddExamDateModal.expectLanguageLevelNotChecked('fra', 'PERUS');
      onAddExamDateModal.expectLanguageLevelNotChecked('deu', 'PERUS');
    });
  });

  describe('Form Submission', () => {
    it('should successfully submit form with all required fields filled', () => {
      const examDate = '15.05.2026';
      const registrationStart = '01.04.2026';
      const registrationEnd = '10.04.2026';

      onAddExamDateModal.enterExamDate(examDate);
      onAddExamDateModal.enterRegistrationStartDate(registrationStart);
      onAddExamDateModal.enterRegistrationEndDate(registrationEnd);

      // Select multiple languages and levels
      onAddExamDateModal.selectLanguageLevel('eng', 'PERUS');
      onAddExamDateModal.selectLanguageLevel('eng', 'KESKI');
      onAddExamDateModal.selectLanguageLevel('fra', 'YLIN');

      // Select exam type
      onAddExamDateModal.selectExamType('speechComprehensionAndWriting');

      // Submit the form
      onAddExamDateModal.clickSubmitButton();

      // modal should close after successful submission
      onAddExamDateModal.expectModalNotExist();
    });
  });
});
