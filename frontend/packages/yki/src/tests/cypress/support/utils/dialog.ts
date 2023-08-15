export const findDialogByText = (text: string) =>
  cy.findByRole('dialog').should('contain', text);
