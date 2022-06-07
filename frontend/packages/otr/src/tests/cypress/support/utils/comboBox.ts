export const selectComboBoxOptionByName = (
  comboBox: Cypress.Chainable,
  name: string
) => {
  comboBox.click();
  cy.findByRole('option', { name }).should('be.visible').click();
};
