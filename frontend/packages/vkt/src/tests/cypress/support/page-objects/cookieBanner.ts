class CookieBanner {
  closeBanner() {
    cy.findByTestId('cookie-banner-accept-button').click();
  }
}

export const onCookieBanner = new CookieBanner();
