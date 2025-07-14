class Toast {
  elements = {
    toastNotification: () => cy.findByTestId(`toast-notification`),
  };

  clickButtonByText(name: string) {
    const regExp = new RegExp(name, 'i');

    this.elements.toastNotification().findByText(regExp).click();
  }

  expectText(text: string) {
    this.elements.toastNotification().should('contain.text', text);
  }
}

export const onToast = new Toast();
