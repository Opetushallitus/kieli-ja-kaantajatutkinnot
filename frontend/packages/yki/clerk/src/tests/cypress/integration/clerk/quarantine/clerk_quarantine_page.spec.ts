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
    onClerkQuarantinePage.clickTab('Aiemmat tarkistukset');
    onClerkQuarantinePage.expectActiveTab('Aiemmat tarkistukset');

    onClerkQuarantinePage.clickTab('Voimassa olevat osallistumiskiellot');
    onClerkQuarantinePage.expectActiveTab(
      'Voimassa olevat osallistumiskiellot',
    );
  });
});
