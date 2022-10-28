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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('WIP: allow user to enroll to the exam event', () => {});
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

  describe('errors when enroll button is clicked on the home page', () => {
    it('exam event received congestion after the home page was opened', () => {
      onPublicHomePage.clickExamEventRow(10);
      onPublicHomePage.clickEnrollButton();

      onPublicHomePage.expectEnrollButtonEnabled();
      onToast.expectText('Tutkintotilaisuus on ruuhkautunut');
    });

    it('registration to exam event closed after the home page was opened', () => {
      onPublicHomePage.clickExamEventRow(11);
      onPublicHomePage.clickEnrollButton();

      onPublicHomePage.expectEnrollButtonEnabled();
      onToast.expectText(
        'Tutkintotilaisuuteen ilmoittautuminen on sulkeutunut'
      );
    });
  });
});
