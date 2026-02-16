import { onClerkRegisterListing } from 'tests/cypress/support/page-objects/clerkRegisterListing';
import { onModifyAgreementModal } from 'tests/cypress/support/page-objects/modifyAgreementModal';
import { onToast } from 'tests/cypress/support/page-objects/toast';

describe('ModifyAgreementModal', () => {
  beforeEach(() => {
    cy.openClerkRegistrationPage();
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.clickModifyButton();
    onModifyAgreementModal.expectModalVisible();
  });

  describe('Modal Display and Structure', () => {
    it('should display the modal with title and organizer information', () => {
      onModifyAgreementModal.expectOrganizerNameDisplayed('Taitotalo');
      onModifyAgreementModal.expectStartDateFieldVisible();
      onModifyAgreementModal.expectEndDateFieldVisible();
      onModifyAgreementModal.expectLanguagesFieldVisible();
    });

    it('should display all form elements', () => {
      onModifyAgreementModal.expectCancelButtonVisible();
      onModifyAgreementModal.elements.saveButton().should('be.visible');
      onModifyAgreementModal.expectLanguageListVisible();
    });
  });

  describe('Modal Interactions - Close Button', () => {
    it('should close modal when close button is clicked', () => {
      onModifyAgreementModal.expectModalVisible();
      onModifyAgreementModal.clickCloseButton();
      onModifyAgreementModal.expectModalNotExist();
    });

    it('should close modal when cancel button is clicked', () => {
      onModifyAgreementModal.expectModalVisible();
      onModifyAgreementModal.clickCancelButton();
      onModifyAgreementModal.expectModalNotExist();
    });

    it('should revert changes when cancel is clicked', () => {
      onModifyAgreementModal.enterStartDate('10.10.2025');
      onModifyAgreementModal.expectLanguageLevelNotChecked('Englanti', 'PERUS');
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.expectLanguageLevelChecked('Englanti', 'PERUS');
      onModifyAgreementModal.clickCancelButton();
      onModifyAgreementModal.expectModalNotExist();
      onClerkRegisterListing.clickModifyButton();
      onModifyAgreementModal.expectModalVisible();
      onModifyAgreementModal.expectLanguageLevelNotChecked('Englanti', 'PERUS');
      onModifyAgreementModal.expectStartDateValue('01.01.2018');
      onModifyAgreementModal.expectEndDateValue('01.01.2029');
    });
  });

  describe('Date Field Validation', () => {
    it('should show error when trying to save without start date', () => {
      onModifyAgreementModal.clearStartDate();
      onModifyAgreementModal.expectStartDateErrorMessageVisible();
    });

    it('should clear error message when start date is entered', () => {
      onModifyAgreementModal.clearStartDate();
      onModifyAgreementModal.expectStartDateErrorMessageVisible();
      onModifyAgreementModal.enterStartDate('15.01.2026');
      onModifyAgreementModal.expectStartDateErrorMessageNotVisible();
    });

    it('should allow entering a start date', () => {
      const testDate = '20.02.2026';
      onModifyAgreementModal.enterStartDate(testDate);
      onModifyAgreementModal.getStartDateValue().should('include', testDate);
    });

    it('should allow entering an end date', () => {
      const testEndDate = '31.12.2027';
      onModifyAgreementModal.enterEndDate(testEndDate);
      onModifyAgreementModal.getEndDateValue().should('include', testEndDate);
    });
  });

  describe('Form Submission', () => {
    it('should successfully save changes with valid start date', () => {
      onModifyAgreementModal.enterStartDate('15.03.2026');
      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
    });

    it('should successfully save with start date and end date', () => {
      onModifyAgreementModal.enterStartDate('15.03.2026');
      onModifyAgreementModal.enterEndDate('31.12.2028');
      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
    });

    it('should successfully save with language selections', () => {
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.toggleLanguageLevel('Ranska', 'YLIN');
      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
    });

    it('should persist date changes after save and reopen', () => {
      const newStartDate = '25.04.2026';
      onModifyAgreementModal.enterStartDate(newStartDate);
      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
      onModifyAgreementModal.clickCloseButton();
      onModifyAgreementModal.expectModalNotExist();
      onClerkRegisterListing.clickModifyButton();
      onModifyAgreementModal.expectModalVisible();
      onModifyAgreementModal
        .getStartDateValue()
        .should('include', newStartDate);
    });

    it('should persist language selections after save and reopen', () => {
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
      onModifyAgreementModal.clickCloseButton();
      onModifyAgreementModal.expectModalNotExist();
      onClerkRegisterListing.clickModifyButton();
      onModifyAgreementModal.expectModalVisible();
      onModifyAgreementModal.expectLanguageLevelChecked('Englanti', 'PERUS');
    });
  });

  describe('Complex User Workflows', () => {
    it('should handle multiple language and date changes', () => {
      onModifyAgreementModal.enterStartDate('10.05.2026');
      onModifyAgreementModal.enterEndDate('10.05.2030');

      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'KESKI');
      onModifyAgreementModal.toggleLanguageLevel('Ranska', 'YLIN');

      onModifyAgreementModal.clickSaveButton();
      onToast.expectText('Muutokset tallennettu onnistuneesti');
    });

    it('should handle deselecting all levels for a language', () => {
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.expectLanguageLevelChecked('Englanti', 'PERUS');
      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.expectLanguageLevelNotChecked('Englanti', 'PERUS');
      onModifyAgreementModal.clickSaveButton();
    });

    it('should allow updating organizer with all field types', () => {
      onModifyAgreementModal.enterStartDate('01.06.2026');
      onModifyAgreementModal.enterEndDate('01.06.2029');

      onModifyAgreementModal.toggleLanguageLevel('Englanti', 'PERUS');
      onModifyAgreementModal.toggleLanguageLevel('Saksa', 'KESKI');
      onModifyAgreementModal.toggleLanguageLevel('Ranska', 'YLIN');

      onModifyAgreementModal.clickSaveButton();
      onModifyAgreementModal.clickCloseButton();
      onModifyAgreementModal.expectModalNotExist();

      onClerkRegisterListing.clickModifyButton();
      onModifyAgreementModal.expectLanguageLevelChecked('Englanti', 'PERUS');
      onModifyAgreementModal.expectLanguageLevelChecked('Saksa', 'KESKI');
      onModifyAgreementModal.expectLanguageLevelChecked('Ranska', 'YLIN');
    });
  });
});
