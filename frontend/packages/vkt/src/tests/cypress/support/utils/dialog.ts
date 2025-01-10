export const findDialogByText = (text: string) =>
  cy.findByRole('dialog').should('contain', text);

export const expectNoDialog = () => cy.findByRole('dialog').should('not.exist');
