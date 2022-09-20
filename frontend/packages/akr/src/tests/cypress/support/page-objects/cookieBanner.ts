class CookieBanner {
  elements = {
    cookieBannerContent: () => cy.get('.cookie-banner__content'),
    cookieBannerDescription: () => cy.findByTestId('cookie-banner-description'),
    cookieBannerAcceptButton: () =>
      cy.findByTestId('cookie-banner-accept-button'),
  };

  expectCookieBannerVisible() {
    this.elements.cookieBannerContent().should('be.visible');
  }

  expectCookieBannerNotVisible() {
    this.elements.cookieBannerContent().should('not.be.visible');
  }

  expectCookieBannerShouldNotExist() {
    this.elements.cookieBannerContent().should('not.exist');
  }
  clickAcceptCookies() {
    this.elements.cookieBannerAcceptButton().should('be.visible').click();
  }
  expectCookieBannerDescription(text: string) {
    this.elements
      .cookieBannerDescription()
      .should('be.visible')
      .should('have.text', text);
  }
}

export const onCookieBanner = new CookieBanner();
