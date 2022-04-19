class Toast {
  clickButtonByText(name: string) {
    const regExp = new RegExp(name, 'i');

    cy.findByRole('alert').findByText(regExp).click();
  }

  expectText(text: string) {
    cy.findByRole('alert').should('contain.text', text);
  }
}

export const onToast = new Toast();
