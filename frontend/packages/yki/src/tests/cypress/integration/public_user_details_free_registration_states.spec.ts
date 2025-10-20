import { onPublicUserDetailsPage } from 'tests/cypress/support/page-objects/publicUserDetailsPage';

describe('PublicUserDetailsPage Free Registration States', () => {
  beforeEach(() => {
    cy.openPublicUserDetailsPage();
    onPublicUserDetailsPage.isVisible();
  });

  it('renders supplement answered free registration (id 1334)', () => {
    cy.findByTestId('registration-card-1334').within(() => {
      cy.findByTestId('registration-state-1334')
        .contains('Odottaa opetushallituksen tarkastusta')
        .should('be.visible');
      cy.findByTestId('free-registration-info-1334')
        .contains(
          'Opetushallitus tarkistaa toimittamasi tutkintotodistuksen. Saat päätöksen tutkintomaksun maksuttomuudesta sähköpostiisi ja YKI-verkkopalveluun asian käsittelyn jälkeen.',
        )
        .should('be.visible');
      cy.findByTestId('exam-payment-1334')
        .contains('0 tai')
        .should('be.visible');
      cy.findAllByRole('button').should('have.length', 1);
      cy.findAllByRole('button').eq(0).contains('Peru ilmoittautuminen');
    });
  });

  it('renders supplement requested free registration (id 1335)', () => {
    cy.findByTestId('registration-card-1335').within(() => {
      cy.findByTestId('registration-state-1335')
        .contains('Odottaa vastaustasi')
        .should('be.visible');
      cy.findByTestId('free-registration-info-1335')
        .contains(
          'Olet saanut täydennyspyynnön koskien toimittamaasi tutkintotodistusta. Vastaa täydennyspyyntöön muokkaamalla ilmoittautumistasi 1.5.2025 mennessä.',
        )
        .should('be.visible');
      cy.findByTestId('exam-payment-1335')
        .contains('0 tai')
        .should('be.visible');
      cy.findAllByRole('button').should('have.length', 2);
      cy.findAllByRole('button').eq(0).contains('Muokkaa ilmoittautumista');
      cy.findAllByRole('button').eq(1).contains('Peru ilmoittautuminen');
    });
  });

  it('renders pending free registration (id 1336)', () => {
    cy.findByTestId('registration-card-1336').within(() => {
      cy.findByTestId('registration-state-1336')
        .contains('Odottaa opetushallituksen tarkastusta')
        .should('be.visible');
      cy.findByTestId('free-registration-info-1336')
        .contains(
          'Opetushallitus tarkistaa toimittamasi tutkintotodistuksen. Saat päätöksen tutkintomaksun maksuttomuudesta sähköpostiisi ja YKI-verkkopalveluun asian käsittelyn jälkeen.',
        )
        .should('be.visible');
      cy.findByTestId('exam-payment-1336')
        .contains('0 tai')
        .should('be.visible');
      cy.findAllByRole('button').should('have.length', 1);
      cy.findAllByRole('button').eq(0).contains('Peru ilmoittautuminen');
    });
  });
});
