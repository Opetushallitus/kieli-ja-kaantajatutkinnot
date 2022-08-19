class Dialog {
  clickButtonByText(name: string) {
    const regExp = new RegExp(name, 'i');

    cy.findByRole('dialog').findByRole('button', { name: regExp }).click();
  }

  expectText(text: string) {
    cy.findByRole('dialog').should('contain.text', text);
  }
}

export const onDialog = new Dialog();
