class Toast {
  elements = {
    toastNotification: () => cy.findByTestId(`toast-notification`),
  };

  expectText(text: string) {
    this.elements.toastNotification().should('contain.text', text);
  }
}

export const onToast = new Toast();
