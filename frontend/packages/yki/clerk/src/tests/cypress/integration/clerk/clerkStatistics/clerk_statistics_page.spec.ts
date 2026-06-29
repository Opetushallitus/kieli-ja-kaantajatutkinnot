import { onClerkStatisticsPage } from 'tests/cypress/support/page-objects/clerkStatisticsPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';

describe('ClerkStatisticsPage', () => {
  beforeEach(() => {
    cy.openClerkStatisticsPage();
  });

  it('should render page heading and download button', () => {
    onClerkStatisticsPage.expectHeadingVisible();
    onClerkStatisticsPage.expectDownloadButtonVisible();
  });

  it('should disable download button when end date is cleared', () => {
    onClerkStatisticsPage.expectDownloadButtonEnabled();
    onClerkStatisticsPage.clearEndDate();
    onClerkStatisticsPage.expectDownloadButtonDisabled();
  });

  it('should complete download without error on valid date range', () => {
    onClerkStatisticsPage.clickDownloadButton();
    onClerkStatisticsPage.expectDownloadButtonEnabled();
    onToast.expectNotExist();
  });
});
