import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';
import { onClerkCustomersSearchPage } from 'tests/cypress/support/page-objects/clerkCustomersSearchPage';

// In the fixtures, "Aino Osallistuja" matches three persons: one individualised,
// one not individualised without registrations, and this one.
const NOT_INDIVIDUALISED_OID = '1.2.246.562.24.82364099324';
const onrUrl = (oid: string) =>
  `https://virkailija.opintopolku.fi/henkilo-ui/oppija/${oid}?permissionCheckService=YKI`;

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

  it('shows the red icon only for a person with a registration who is not individualised', () => {
    onClerkCustomersSearchPage.search('Aino Osallistuja');

    onClerkCustomersSearchPage.expectTableRowCount(3);
    onClerkCustomersSearchPage.elements
      .notIndividualisedIcons()
      .should('have.length', 1);
    onClerkCustomersSearchPage.elements
      .table()
      .find('tbody tr')
      .eq(2)
      .should('contain.text', NOT_INDIVIDUALISED_OID)
      .findByRole('button', { name: 'Oppijaa ei ole yksilöity' })
      .should('exist');
  });

  it('opens a popover with a link to ONR from the red icon', () => {
    onClerkCustomersSearchPage.search('Aino Osallistuja');

    onClerkCustomersSearchPage.elements.notIndividualisedIcons().click();
    cy.findByRole('heading', { name: 'Oppijaa ei ole yksilöity' }).should(
      'be.visible',
    );
    cy.findByRole('link', { name: 'oppijanumerorekisterissä' }).should(
      'have.attr',
      'href',
      onrUrl(NOT_INDIVIDUALISED_OID),
    );

    cy.findByRole('button', { name: 'Sulje' }).click();
    cy.findByRole('heading', { name: 'Oppijaa ei ole yksilöity' }).should(
      'not.exist',
    );
  });

  it('shows the red icon for a person with a registration and no status', () => {
    // The fixture has no individualised field, as when ONR has not been asked
    // yet: the backend sends null, which the search turns into a missing field.
    const oid = '1.2.246.562.198.84579922927';
    onClerkCustomersSearchPage.search(oid);

    onClerkCustomersSearchPage.expectTableRowCount(1);
    onClerkCustomersSearchPage.elements
      .notIndividualisedIcons()
      .should('have.length', 1);
  });

  it('does not link the OID, also when the red icon is in front of it', () => {
    onClerkCustomersSearchPage.search('Aino Osallistuja');

    cy.findByText(NOT_INDIVIDUALISED_OID).should('be.visible');
    cy.findByRole('link', { name: NOT_INDIVIDUALISED_OID }).should('not.exist');
  });

  it('the filter shows only persons with a registration who are not individualised', () => {
    onClerkCustomersSearchPage.elements.onlyNotIndividualisedCheckbox().check();
    onClerkCustomersSearchPage.search('Aino Osallistuja');

    cy.findByText('1 osallistujaa').should('be.visible');
    onClerkCustomersSearchPage.expectTableRowCount(1);
    onClerkCustomersSearchPage.elements
      .table()
      .find('tbody tr')
      .first()
      .should('contain.text', NOT_INDIVIDUALISED_OID);
  });
});
