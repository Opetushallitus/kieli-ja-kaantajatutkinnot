import { onClerkQuarantinePage } from 'tests/cypress/support/page-objects/clerkQuarantinePage';

describe('ClerkQuarantinePage - Aiemmat tarkistukset tab', () => {
  beforeEach(() => {
    cy.openClerkQuarantinePage();
    onClerkQuarantinePage.clickTab('Aiemmat tarkistukset');
  });

  it('should display correct number of rows', () => {
    onClerkQuarantinePage.expectTableRowCount('past', 2);
  });

  it('should display correct data in first row', () => {
    onClerkQuarantinePage.expectCorrectRowData('past', 0, [
      'IlmoittautujaOsallistumiskielto',
      'suomi',
      '20.9.2025',
      'Marko VirtanenMarkku Virtanen',
      '1980-05-151980-05-15',
      '150580-900T150580-900T',
      'marko.virtanen@gmail.commarkku.virtanen@ban.fi',
      '+358401234567+358401234567',
      'Ei Maksanut',
      'Peru ilmoitt.',
    ]);
  });

  it('should display correct data in second row', () => {
    onClerkQuarantinePage.expectCorrectRowData('past', 1, [
      'IlmoittautujaOsallistumiskielto',
      'suomi',
      '15.11.2025',
      'Pirjo Mäkinen-LeinonenPirjo Mäkinen',
      '1975-11-031975-11-03',
      '031175-812A031175-812A',
      'pirjo.ml@yahoo.compirjo.makinen@ban.fi',
      '+358509876543+358509876543',
      'Maksanut',
      '',
    ]);
  });
});
