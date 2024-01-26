class CookieBanner {
  getBanner() {
    return cy.findByTestId('cookie-banner-accept-button');
  }
  closeBanner() {
    this.getBanner().click();
  }
}

export const onCookieBanner = new CookieBanner();
