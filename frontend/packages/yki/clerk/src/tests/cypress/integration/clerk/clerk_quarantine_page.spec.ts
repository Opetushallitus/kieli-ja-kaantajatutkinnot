import { onClerkQuarantinePage } from 'tests/cypress/support/page-objects/clerkQuarantinePage';
import { onToast } from 'tests/cypress/support/page-objects/toast';

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
      .should('have.text', 'Odottavat tarkistukset (4)');
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
    onClerkQuarantinePage.expectActiveTab('Odottavat tarkistukset (4)');
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

  describe('Odottavat tarkistukset tab', () => {
    beforeEach(() => {
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

  describe('Aiemmat tarkistukset tab', () => {
    beforeEach(() => {
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

  describe('Voimassa olevat osallistumiskiellot tab', () => {
    beforeEach(() => {
      onClerkQuarantinePage.clickTab('Voimassa olevat osallistumiskiellot');
    });

    it('should add new osallistumiskielto', () => {
      onClerkQuarantinePage.elements.addQuarantineButton().click();
      onClerkQuarantinePage.modal.expectVisible();

      onClerkQuarantinePage.modal.fillFirstName('Testi');
      onClerkQuarantinePage.modal.fillLastName('Henkilö');
      onClerkQuarantinePage.modal.fillSsn('010190-123A');
      onClerkQuarantinePage.modal.fillEmail('testi@example.com');
      onClerkQuarantinePage.modal.fillPhone('+358401234567');
      onClerkQuarantinePage.modal.selectLanguage('fin');
      onClerkQuarantinePage.modal.fillStartDate('01.06.2026');
      onClerkQuarantinePage.modal.fillEndDate('01.06.2027');
      onClerkQuarantinePage.modal.fillCaseNumber('DIAARINUMERO-001');

      onClerkQuarantinePage.modal.submit();

      onClerkQuarantinePage.modal.expectNotExist();
      onToast.expectText('Osallistumiskielto lisätty onnistuneesti');
    });
  });
});
