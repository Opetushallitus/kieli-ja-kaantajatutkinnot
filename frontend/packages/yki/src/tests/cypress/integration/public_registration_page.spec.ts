import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import { findDialogByText } from 'tests/cypress/support/utils/dialog';
import { worker } from 'tests/msw/browser';
import { SuomiFiAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';

describe('PublicRegistrationPage', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
  });

  it('is visible', () => {
    onPublicRegistrationPage.isVisible();
  });

  describe('allows filtering exams', () => {
    it('but filter criteria must be selected first', () => {
      onPublicRegistrationPage.search();
      const dialogHeading = 'Valitse tutkinnon kieli ja taso';
      findDialogByText(dialogHeading).should('be.visible');
      findDialogByText(dialogHeading)
        .findByText('takaisin', { exact: false })
        .click();
      cy.findByRole('dialog').should('not.exist');
    });

    it('all results are available initially', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(10);
    });

    it('can filter by current availability', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(4);
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(3);
    });

    it('can filter by exam language and level', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(9);

      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.search();
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
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultRows()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
    });

    before(() => {
      worker.stop();
      worker.use(
        http.get(APIEndpoints.User, () => {
          return HttpResponse.json(SuomiFiAuthenticatedSessionResponse);
        }),
      );
      worker.start();
    });

    it('or by continuing with current identification data if already authenticated', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultRows()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Jatka tunnistautuneena');
    });

    after(() => {
      worker.stop();
      worker.resetHandlers();
      worker.start();
    });

    it('or by subscribing to notifications of available seats', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('perustaso');
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultRows()
        .findByRole('button', { name: /Tilaa ilmoitus peruutuspaikoista/ })
        .click();

      onInitRegistrationPage.expectTitle('Tilaa ilmoitus peruutuspaikoista');
    });
  });
});
