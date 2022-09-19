import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';

describe('Cookie Banner', () => {
  it('should not show cookie banner if mandatory cookies have been accepted', () => {
    cy.openPublicHomePage();

    onPublicHomePage.expectCookieBannerShouldNotExist();
  });
  it('should show cookie banner if mandatory cookies have not been accepted yet ', () => {
    cy.openPublicHomePage(false);

    onPublicHomePage.expectCookieBannerVisible();
    onPublicHomePage.expectCookieBannerDescription(
      'Tämä sivusto käyttää välttämättömiä evästeitä toimiakseen. Voit lukea lisätietoa evästeistä painamallatästä linkistä'
    );
    onPublicHomePage.clickAcceptCookies();
    onPublicHomePage.expectCookieBannerNotVisible();
  });
});
