import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';

const readSpeakLabel = 'Tekstin ymmärtäminen ja puhuminen';

describe('PublicPartialExamRegistration', () => {
  beforeEach(() => {
    cy.openPublicRegistrationPage();
    cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');

    onPublicRegistrationPage.selectExamLanguage('suomi');
    onPublicRegistrationPage.selectExamLevel('ylin taso');
    onPublicRegistrationPage.search();
  });

  it('shows the exam type, fee and availability for each part of a READ_SPEAK session', () => {
    onPublicRegistrationPage
      .getResultCardContaining(readSpeakLabel)
      .within(() => {
        cy.contains(readSpeakLabel).should('be.visible');
        cy.contains('td', 'Tekstin ymmärtäminen').should('be.visible');
        cy.contains('td', 'Puhuminen').should('be.visible');

        cy.contains('0 / 127 €').should('be.visible');
        cy.contains('0 / 43 €').should('be.visible');
        cy.contains('0 / 84 €').should('be.visible');

        cy.contains('Ilmoittaudu osakokeisiin erikseen').should('be.visible');
      });
  });

  it('lets the user start registering to a single available part', () => {
    onPublicRegistrationPage
      .getResultCardContaining(readSpeakLabel)
      .findByRole('button', { name: 'Ilmoittaudu' })
      .click();

    onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
  });

  it('offers a queue registration for a part whose quota is full', () => {
    onPublicRegistrationPage
      .getResultCardContaining(readSpeakLabel)
      .findByRole('button', { name: 'Ilmoittaudu jonoon' })
      .click();

    onInitRegistrationPage.expectTitle(
      'Tunnistaudu jonoon ilmoittautumista varten',
    );
  });
});
