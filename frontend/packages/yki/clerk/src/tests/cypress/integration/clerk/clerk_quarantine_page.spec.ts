import { onClerkQuarantinePage } from 'tests/cypress/support/page-objects/clerkQuarantinePage';

describe('ClerkQuarantinePage', () => {
  beforeEach(() => {
    cy.openClerkQuarantinePage();
  });

  it('should display page heading', () => {
    onClerkQuarantinePage.isVisible();
  });

  it('should display all three tabs', () => {
    onClerkQuarantinePage.elements.tabs().should('have.length', 3);
    onClerkQuarantinePage.elements
      .tabs()
      .eq(0)
      .should('have.text', 'Odottavat tarkistukset');
    onClerkQuarantinePage.elements
      .tabs()
      .eq(1)
      .should('have.text', 'Aiemmat tarkistukset');
    onClerkQuarantinePage.elements
      .tabs()
      .eq(2)
      .should('have.text', 'Voimassa olevat osallistumiskiellot');
  });

  it('should have pending tab active by default', () => {
    onClerkQuarantinePage.expectActiveTab('Odottavat tarkistukset');
  });

  it('should switch active tab on click', () => {
    // TODO: Once tab filtering is implemented, add assertions for row count changes per tab.
    onClerkQuarantinePage.clickTab('Aiemmat tarkistukset');
    onClerkQuarantinePage.expectActiveTab('Aiemmat tarkistukset');

    onClerkQuarantinePage.clickTab('Voimassa olevat osallistumiskiellot');
    onClerkQuarantinePage.expectActiveTab(
      'Voimassa olevat osallistumiskiellot',
    );
  });

  it('should display correct number of rows', () => {
    onClerkQuarantinePage.expectTableRowCount(4);
  });

  it('should display correct data in first row', () => {
    onClerkQuarantinePage.expectCorrectRowData(0, [
      'suomi',
      '20.9.2025',
      'Markku Virtanen',
      '1980-05-15',
      '150580-900T',
      'markku.virtanen@ban.fi',
      '+358401234567',
    ]);
  });
});
