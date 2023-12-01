import { onCookieBanner } from 'tests/cypress/support/page-objects/cookieBanner';

describe('Cookie Banner', () => {
  it('should not show cookie banner if mandatory cookies have been accepted', () => {
    cy.openPublicHomePage();

    onCookieBanner.expectCookieBannerShouldNotExist();
  });

  it('should show cookie banner if mandatory cookies have not been accepted yet ', () => {
    cy.openPublicHomePage(false);

    onCookieBanner.expectCookieBannerVisible();
    onCookieBanner.expectCookieBannerDescription(
      'Tämä sivusto käyttää välttämättömiä evästeitä toimiakseen.'
    );
    onCookieBanner.clickAcceptCookies();
    onCookieBanner.expectCookieBannerShouldNotExist();
  });
});
