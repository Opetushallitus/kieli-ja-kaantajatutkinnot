import { onLangSelector } from 'tests/cypress/support/page-objects/langSelector';

describe('LangSelector', () => {
  it('should change the language', () => {
    cy.openPublicHomePage();
    onLangSelector
      .languageOption('Suomeksi')
      .should('have.attr', 'aria-current', 'true');
    onLangSelector
      .languageOption('In English')
      .should('have.attr', 'aria-current', 'false');

    onLangSelector.languageOption('In English').click();

    onLangSelector
      .languageOption('Suomeksi')
      .should('have.attr', 'aria-current', 'false');
    onLangSelector
      .languageOption('In English')
      .should('have.attr', 'aria-current', 'true');
  });
});
