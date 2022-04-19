import { onLangSelector } from 'tests/cypress/support/page-objects/langSelector';

describe('LangSelector', () => {
  it('should show the Finnish language as a default language', () => {
    cy.openPublicHomePage();

    onLangSelector.elements.langSelector().should('contain.text', 'Suomeksi');
  });

  it('should change the language', () => {
    // arrange
    cy.openPublicHomePage();
    // act
    onLangSelector.clickLangSelector();
    onLangSelector.selectLangOption('in english');
    // assert
    onLangSelector.elements.langSelector().should('contain.text', 'In English');
  });
});
