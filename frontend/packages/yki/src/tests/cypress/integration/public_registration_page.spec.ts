import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
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
    it.skip('but filter criteria must be selected first', () => {
      onPublicRegistrationPage.showResults();
      const dialogHeading = 'Valitse tutkinnon kieli ja taso';
      findDialogByText(dialogHeading).should('be.visible');
      findDialogByText(dialogHeading)
        .findByText('takaisin', { exact: false })
        .click();
      cy.findByRole('dialog').should('not.exist');
    });

    it.skip('all results are available initially', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultsCount(10);
    });

    it.skip('can filter by current availability', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultsCount(4);
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultsCount(3);
    });

    it.skip('can filter by exam language and level', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultsCount(9);

      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.showResults();
      onPublicRegistrationPage.expectResultsCount(3);
      onPublicRegistrationPage.expectResultRowsCount(3);
    });
  });

  describe('allows starting the exam registration process', () => {
    it('by selecting an identification method', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.showResults();

      onPublicRegistrationPage
        .getResultRows()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
    });

    it('or by subscribing to notifications of available seats', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('perustaso');
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.showResults();

      onPublicRegistrationPage
        .getResultRows()
        .findByRole('button', { name: /Tilaa ilmoitus peruutuspaikoista/ })
        .click();

      onInitRegistrationPage.expectTitle('Tilaa ilmoitus peruutuspaikoista');
    });
  });
});
