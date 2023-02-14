import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { onToast } from 'tests/cypress/support/page-objects/toast';

beforeEach(() => {
  cy.openPublicHomePage();
});

describe('Public enrollment', () => {
  describe('to exam event with room', () => {
    const EXAM_EVENT_ID = 2;

    beforeEach(() => {
      onPublicHomePage.clickExamEventRow(EXAM_EVENT_ID);
      onPublicHomePage.clickEnrollButton();
    });

    it('reservation should have timer', () => {
      onPublicHomePage.clickEnrollAuthenticateButton();
      onPublicHomePage.expectReservationTimeLeft('30', '00');
      cy.tick(3000);
      onPublicHomePage.expectReservationTimeLeft('29', '57');
      cy.tick(30 * 60 * 1000);
      onPublicHomePage.expectReservationTimeLeft('00', '00');
    });

    it('reservation should allow renewal', () => {
      onPublicHomePage.clickEnrollAuthenticateButton();
      cy.tick(29 * 60 * 1000);
      onPublicHomePage.clickReservationRenewButton();
      cy.tick(30 * 1000);
      onPublicHomePage.expectReservationTimeLeft('29', '30');
    });

    it('reservation expired should display info modal', () => {
      onPublicHomePage.clickEnrollAuthenticateButton();
      cy.tick(31 * 60 * 1000);
      onPublicHomePage.expectReservationExpiredOkButtonEnabled();
    });
  });

  describe('to exam event that is full', () => {
    const EXAM_EVENT_ID = 5;

    beforeEach(() => {
      onPublicHomePage.clickExamEventRow(EXAM_EVENT_ID);
      onPublicHomePage.clickEnrollButton();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('WIP: allow user to enroll to the exam event', () => {});
  });

  // TODO: Enable again once auth flow is complete.
  describe('errors when enroll button is clicked on the home page', () => {
    it.skip('exam event received congestion after the home page was opened', () => {
      onPublicHomePage.clickExamEventRow(10);
      onPublicHomePage.clickEnrollButton();

      onPublicHomePage.expectEnrollButtonEnabled();
      onToast.expectText('Tutkintotilaisuus on ruuhkautunut');
    });

    it.skip('registration to exam event closed after the home page was opened', () => {
      onPublicHomePage.clickExamEventRow(11);
      onPublicHomePage.clickEnrollButton();

      onPublicHomePage.expectEnrollButtonEnabled();
      onToast.expectText(
        'Tutkintotilaisuuteen ilmoittautuminen on sulkeutunut'
      );
    });
  });
});
