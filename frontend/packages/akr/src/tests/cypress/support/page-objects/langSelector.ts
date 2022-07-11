class LangSelector {
  elements = {
    langSelector: () => cy.findByTestId('lang-selector'),
    option: (name: string) => {
      const regExp = new RegExp(name, 'i');

      return cy.findByRole('option', { name: regExp });
    },
  };

  clickLangSelector() {
    this.elements.langSelector().click();
  }

  selectLangOption(name: string) {
    this.elements.option(name).click();
  }
}

export const onLangSelector = new LangSelector();
