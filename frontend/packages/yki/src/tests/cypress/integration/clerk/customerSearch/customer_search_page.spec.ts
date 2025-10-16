describe('CustomerSearchPage', () => {
  beforeEach(() => {
    cy.openCustomerSearchPage();
  });

  it('is visible', () => {
    cy.findByRole('heading', { name: 'Asiakashaku' }).should('be.visible');
  });
});
