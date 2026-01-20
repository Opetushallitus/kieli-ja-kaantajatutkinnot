import { onClerkFreeRegistrationPage } from 'tests/cypress/support/page-objects/clerkFreeRegistrationPage';

describe('ClerkFreeRegistrationPage', () => {
  beforeEach(() => {
    cy.openClerkFreeRegistrationPage();
  });

  it('is visible', () => {
    onClerkFreeRegistrationPage.isVisible();
  });

  it('shows heading, filtered count, and loads pending registrations with pagination', () => {
    cy.findByText('Maksuttomuuden tarkastukset').should('be.visible');
    cy.findByText('11 ilmoittautujaa').should('be.visible');
    onClerkFreeRegistrationPage.expectTableRowCount(10);

    cy.findByRole('button', { name: /mene sivulle 2/i }).click();
    onClerkFreeRegistrationPage.expectTableRowCount(1);

    cy.findByRole('button', { name: /mene sivulle 1/i }).click();
    cy.findByRole('combobox').first().click();
    cy.get('[data-value="30"]').click();
    onClerkFreeRegistrationPage.expectTableRowCount(11);
  });

  it('switches to previous tab and shows only pending / previous', () => {
    cy.openClerkFreeRegistrationPage();
    cy.findByText('Aiemmat tarkastukset').click();
    onClerkFreeRegistrationPage.expectTableRowCount(2);
  });

  it('displays details correctly for a row', () => {
    cy.openClerkFreeRegistrationPage();

    onClerkFreeRegistrationPage.expectCorrectRowData(0, [
      'Testi1 Testaaja112233-99991.2.246.562.10.39706139511',
      'Maksuttomuus tarkastamatta',
      '12.11.2025',
      '21.11.2025',
    ]);
  });

  it('displays error view when API fails', () => {
    cy.openClerkFreeRegistrationPage({ 'free-registration-error-500': '1' });

    cy.get('h2')
      .should('exist')
      .and('contain.text', 'Tietojen lataaminen epäonnistui');
  });

  it('navigates to details page when clicking action link', () => {
    cy.openClerkFreeRegistrationPage();

    onClerkFreeRegistrationPage.clickTableRowLinkAtIndex(0);

    cy.url().should('match', /maksuttomuus\/\d+$/);
  });
});
