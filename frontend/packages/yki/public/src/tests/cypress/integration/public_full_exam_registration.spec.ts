import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';

describe('PublicFullExamRegistration', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
    cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');
  });

  it('lets the user start registering to a full exam', () => {
    onPublicRegistrationPage.selectExamLanguage('saksa');
    onPublicRegistrationPage.selectExamLevel('ylin taso');
    onPublicRegistrationPage.search();

    onPublicRegistrationPage
      .getResultCards()
      .findByRole('button', { name: /Ilmoittaudu/ })
      .click();

    onInitRegistrationPage.expectTitle(
      'Tunnistaudu jonoon ilmoittautumista varten',
    );
  });
});
