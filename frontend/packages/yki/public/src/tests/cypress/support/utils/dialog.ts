export const findDialogByText = (text: string) =>
  cy.findByRole('dialog').should('contain', text);

export const findAlertDialogByText = (text: string) =>
  cy.findByRole('alertdialog').should('contain', text);
