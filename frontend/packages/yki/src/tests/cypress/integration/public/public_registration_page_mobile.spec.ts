import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';

describe('PublicRegistrationPage', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.openPublicRegistrationPage();
    cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');
  });

  describe('when registering for an exam on Mobile', () => {
    it('shows timer with time remaining', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet', true);
      onPublicRegistrationPage.selectExamLevel('kaikki tasot', true);
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultRowsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');

      cy.get('.MuiButton-contained').click();
      onPublicRegistrationPage.expectReservationTimerText(
        true,
        'Paikkavarauksesi YKI-testiin umpeutuu: 30:00',
      );
    });

    it('displays reservation expired modal when reservation expires and allows navigation to frontpage', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet', true);
      onPublicRegistrationPage.selectExamLevel('kaikki tasot', true);
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultRowsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');

      cy.get('.MuiButton-contained').click();
      onPublicRegistrationPage.expectReservationTimerText(
        true,
        'Paikkavarauksesi YKI-testiin umpeutuu: 30:00',
      );
      cy.clock().tick(30 * 60 * 1000); // Advance time by 30 minutes

      cy.findByTestId('public-registration__reservation-expired-modal').should(
        'be.visible',
      );
      cy.findByRole('button', { name: 'Palaa aloitussivulle' }).click();
      cy.url().should('eq', Cypress.config().baseUrl + '/yki/ilmoittautuminen');
    });
  });
});
