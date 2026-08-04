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
    cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');
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
      onPublicRegistrationPage.expectResultsCount(13);
    });

    it('can filter by current availability', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(6);
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(5);
    });

    it('can filter by exam language and level', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(12);

      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(4);
      onPublicRegistrationPage.expectResultCardsCount(4);
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
        .getResultCards()
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
        .getResultCards()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
      onInitRegistrationPage.expectVisibleContinueToRegistrationButton();
    });

    after(() => {
      worker.stop();
      worker.resetHandlers();
      worker.start();
    });
  });

  describe('does not allow starting the exam registration process', () => {
    it('when already registered', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'Olet jo ilmoittautunut YKI-testiin.',
      );
    });

    it('when full', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(2)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'YKI-testi on täynnä. Voit ilmoittautua jonoon.',
      );
    });

    it('when closed', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(3)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'Ilmoittautuminen on sulkeutunut',
      );
    });

    after(() => {
      worker.stop();
      worker.resetHandlers();
      worker.start();
    });
  });

  describe('when registering for an exam on Desktop', () => {
    it('shows timer with time remaining when type is ADMISSION', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');

      cy.get('.MuiButton-contained').click();
      onPublicRegistrationPage.expectReservationTimerText(
        true,
        'Paikkavarauksesi YKI-testiin umpeutuu: 30:00',
      );
    });

    it('no timer is shown when type is QUEUE', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
        .findByRole('button', { name: 'Ilmoittaudu jonoon' })
        .click();

      onInitRegistrationPage.expectTitle(
        'Tunnistaudu jonoon ilmoittautumista varten',
      );

      cy.get('.MuiButton-contained').click();
      onPublicRegistrationPage.expectReservationTimerText(false);
    });
  });
});
