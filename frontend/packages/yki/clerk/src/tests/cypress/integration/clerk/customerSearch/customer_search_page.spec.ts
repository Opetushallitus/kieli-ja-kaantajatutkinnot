import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';
import { onClerkCustomersSearchPage } from 'tests/cypress/support/page-objects/clerkCustomersSearchPage';

describe('CustomerSearchPage', () => {
  beforeEach(() => {
    cy.openCustomerSearchPage();
  });

  it('shows empty state before search', () => {
    cy.findByRole('heading', { name: 'Asiakashaku' }).should('be.visible');
    onClerkCustomersSearchPage.expectNoTable();
  });

  it('search with query filters results', () => {
    onClerkCustomersSearchPage.search('Salla');

    onClerkCustomersSearchPage.elements.table().should('be.visible');
    onClerkCustomersSearchPage.elements
      .table()
      .find('tbody tr')
      .first()
      .should('contain.text', 'Salla');
  });

  it('pagination navigates between pages', () => {
    onClerkCustomersSearchPage.search('');

    cy.findByText('103 osallistujaa').should('be.visible');
    onClerkCustomersSearchPage.expectTableRowCount(20);

    cy.findByRole('button', { name: /mene sivulle 2/i }).click();
    onClerkCustomersSearchPage.expectTableRowCount(20);

    cy.findByRole('button', { name: /mene sivulle 6/i }).click();
    onClerkCustomersSearchPage.expectTableRowCount(3);
  });

  it('navigates to customer details page when clicking a row', () => {
    onClerkCustomersSearchPage.search('');

    const oid = '1.2.246.562.24.82364099322';
    cy.findByRole('link', { name: 'Jori Testi Häkkinen-Testi' }).click();
    cy.url().should('include', oid);
    onClerkCustomerDetailsPage.isVisible(oid);
  });
});
