import { onClerkQuarantinePage } from 'tests/cypress/support/page-objects/clerkQuarantinePage';

describe('ClerkQuarantinePage - Odottavat tarkistukset tab', () => {
  beforeEach(() => {
    cy.openClerkQuarantinePage();
    onClerkQuarantinePage.clickTab('Odottavat tarkistukset');
  });

  it('should display correct number of rows', () => {
    onClerkQuarantinePage.expectTableRowCount('pending', 4);
  });

  it('should display correct data in first row', () => {
    onClerkQuarantinePage.expectCorrectRowData('pending', 0, [
      'IlmoittautujaOsallistumiskielto',
      'suomi',
      '20.9.2025',
      'Marko VirtanenMarkku Virtanen',
      '1980-05-151980-05-15',
      '150580-900T150580-900T',
      'marko.virtanen@gmail.commarkku.virtanen@ban.fi',
      '+358401234567+358401234567',
    ]);
  });
});
