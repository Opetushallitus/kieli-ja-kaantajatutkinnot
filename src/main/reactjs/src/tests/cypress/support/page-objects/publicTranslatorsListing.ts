class PublicTranslatorsListing {
  elements = {
    translatorRow: (id: string) =>
      cy.findByTestId(`public-translators__id-${id}-row`),
    contactRequestBtn: () =>
      cy.findByTestId('public-translators__contact-request-btn'),
  };

  clickTranslatorRow(id: string) {
    this.elements.translatorRow(id).click();
  }

  openContactRequest() {
    this.elements.contactRequestBtn().click();
  }

  expectTranslatorVisible(id: string) {
    cy.findByTestId(`public-translators__id-${id}-row`).should('be.visible');
  }

  expectTranslatorsCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }

  expectEmptyListing() {
    cy.get('.homepage__grid-container__result-box').should('be.empty');
  }
}

export const onPublicTranslatorsListing = new PublicTranslatorsListing();
