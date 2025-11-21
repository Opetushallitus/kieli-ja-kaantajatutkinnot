export const selectComboBoxOptionByName = (
  comboBox: Cypress.Chainable,
  name: string,
  isPhone: boolean = false,
) => {
  cy.wait(50);
  if (isPhone) {
    // On mobile, the component renders as a native select
    comboBox.select(name);
  } else {
    // On desktop, it's an autocomplete combobox
    comboBox.click();
    cy.findByRole('option', { name }).scrollIntoView();
    cy.findByRole('option', { name }).should('be.visible').click();
  }
};
