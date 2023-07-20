class LangSelector {
  elements = {
    langSelector: () =>
      cy.findByRole('navigation', { name: 'Kieli / Språk / Language' }),
  };

  languageOption(label: string) {
    return this.elements.langSelector().findByRole('button', { name: label });
  }
}

export const onLangSelector = new LangSelector();
