import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';
import { onClerkCustomersSearchPage } from 'tests/cypress/support/page-objects/clerkCustomersSearchPage';

describe('CustomerSearchPage', () => {
  beforeEach(() => {
    cy.openCustomerSearchPage();
  });

  it('is visible', () => {
    cy.openClerkCustomersSearchPage();
    cy.findByRole('heading', { name: 'Asiakashaku' }).should('be.visible');

    // "header"
    cy.findAllByText('103 osallistujaa').should('be.visible');

    const personsTable = onClerkCustomersSearchPage.elements.table;

    // Assert headers
    personsTable().find('thead tr th').first().should('have.text', 'Nimi');
    personsTable()
      .find('thead tr th')
      .eq(1)
      .should('have.text', 'Ilmoittautumiset');

    // Assert first row
    personsTable()
      .find('tbody tr td')
      .first()
      .should('contain.text', 'Jori Testi Häkkinen-Testi')
      .and('contain.text', '280105A911J')
      .and('contain.text', '1.2.246.562.24.82364099322');

    personsTable().find('tbody tr td').eq(1).should('have.text', '11');
  });

  it('navigates to customer details page when clicking a row', () => {
    const oid = '1.2.246.562.24.82364099322';

    cy.findByRole('link', { name: 'Jori Testi Häkkinen-Testi' }).click();
    cy.url().should('include', oid);
    onClerkCustomerDetailsPage.isVisible(oid);
  });
});
