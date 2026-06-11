import { onClerkQuarantinePage } from 'tests/cypress/support/page-objects/clerkQuarantinePage';
import { onToast } from 'tests/cypress/support/page-objects/toast';

describe('ClerkQuarantinePage - Voimassa olevat osallistumiskiellot tab', () => {
  beforeEach(() => {
    cy.openClerkQuarantinePage();
    onClerkQuarantinePage.clickTab('Voimassa olevat osallistumiskiellot');
  });

  it('should display correct number of rows', () => {
    onClerkQuarantinePage.expectTableRowCount('active', 3);
  });

  it('should display correct data in first row', () => {
    onClerkQuarantinePage.expectCorrectRowData('active', 0, [
      '1.12.2022 - 1.6.2025',
      'Ruotsi',
      'Koira Ihminen',
      '1992-12-12',
      '121292A7121',
      'asdasda@test.fi',
      '+358401234567',
      'MuokkaaPoista',
    ]);
  });

  it('should prefill edit modal with row data', () => {
    onClerkQuarantinePage.clickRowAction('active', 0, 'Muokkaa');
    onClerkQuarantinePage.editModal.expectVisible();

    onClerkQuarantinePage.editModal.expectFieldValue('firstName', 'Koira');
    onClerkQuarantinePage.editModal.expectFieldValue('lastName', 'Ihminen');
    onClerkQuarantinePage.editModal.expectFieldValue('birthdate', '12.12.1992');
    onClerkQuarantinePage.editModal.expectFieldValue('ssn', '121292A7121');
    onClerkQuarantinePage.editModal.expectFieldValue(
      'email',
      'asdasda@test.fi',
    );
    onClerkQuarantinePage.editModal.expectFieldValue('phone', '+358401234567');
    onClerkQuarantinePage.editModal.expectFieldValue(
      'caseNumber',
      'OPH-1001-2022',
    );
    onClerkQuarantinePage.editModal.expectLanguageSelected('swe');
  });

  it('should show delete confirmation with row details', () => {
    onClerkQuarantinePage.clickRowAction('active', 0, 'Poista');
    onClerkQuarantinePage.deleteModal.expectVisible();

    onClerkQuarantinePage.deleteModal.expectDescriptionContains([
      'Koira Ihminen',
      '121292A7121',
      '1.12.2022 - 1.6.2025',
      'ruotsi',
    ]);
  });

  it('should close delete modal on cancel without removing the row', () => {
    onClerkQuarantinePage.clickRowAction('active', 0, 'Poista');
    onClerkQuarantinePage.deleteModal.expectVisible();

    onClerkQuarantinePage.deleteModal.cancel();

    onClerkQuarantinePage.deleteModal.expectNotExist();
    onClerkQuarantinePage.expectTableRowCount('active', 3);
  });

  // These tests remove data from MSF's state (handler.ts),
  // running these before adding mixes the state of the previous tests, making them fail.

  it('should close edit modal after successful submit', () => {
    onClerkQuarantinePage.clickRowAction('active', 0, 'Muokkaa');
    onClerkQuarantinePage.editModal.expectVisible();

    onClerkQuarantinePage.editModal.fillFirstName('Muutettu');
    onClerkQuarantinePage.editModal.submit();

    onClerkQuarantinePage.editModal.expectNotExist();
  });

  it('should delete osallistumiskielto on confirm', () => {
    onClerkQuarantinePage.clickRowAction('active', 0, 'Poista');
    onClerkQuarantinePage.deleteModal.expectVisible();

    onClerkQuarantinePage.deleteModal.confirm();

    onClerkQuarantinePage.deleteModal.expectNotExist();
    onToast.expectText('Osallistumiskielto poistettu');
    onClerkQuarantinePage.expectTableRowCount('active', 2);
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
