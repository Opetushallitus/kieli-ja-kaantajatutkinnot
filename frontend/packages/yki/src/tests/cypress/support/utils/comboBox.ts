export const selectComboBoxOptionByName = (
  comboBox: Cypress.Chainable,
  name: string,
) => {
  cy.wait(50);
  comboBox.click();
  cy.findByRole('option', { name }).scrollIntoView();
  cy.findByRole('option', { name }).should('be.visible').click();
};
