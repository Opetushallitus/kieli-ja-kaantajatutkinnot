export const selectComboBoxOptionByName = (
  comboBox: Cypress.Chainable,
  name: string
) => {
  comboBox.click();
  cy.findByRole('option', { name }).scrollIntoView();
  cy.findByRole('option', { name }).should('be.visible').click();
};
