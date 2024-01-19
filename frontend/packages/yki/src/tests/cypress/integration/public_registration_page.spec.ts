import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import { findDialogByText } from 'tests/cypress/support/utils/dialog';

describe('PublicRegistrationPage', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
  });

  it('is visible', () => {
    onPublicRegistrationPage.isVisible();
  });

  describe('allows filtering exams', () => {
    it('but filter criteria must be selected first', () => {
      onPublicRegistrationPage.showResults();
      const dialogHeading = 'Valitse tutkinnon kieli ja taso';
      findDialogByText(dialogHeading).should('be.visible');
      findDialogByText(dialogHeading)
        .findByText('takaisin', { exact: false })
        .click();
      cy.findByRole('dialog').should('not.exist');
    });

    it('all results are available initially', () => {
      onPublicRegistrationPage.expectResultsCount(10);
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.expectResultsCount(10);
    });

    it('can filter by current availability', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.expectResultsCount(4);
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.expectResultsCount(3);
    });

    it('can filter by exam language and level', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.expectResultsCount(9);

      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.expectResultsCount(3);

      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultRowsCount(3);
    });
  });
});
