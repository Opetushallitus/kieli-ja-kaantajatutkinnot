import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';

describe('ClerkCustomerDetailsPage', () => {
  before(() => {
    DateUtils.setDayjsLocale(AppLanguage.Finnish);
  });

  it('is visible', () => {
    cy.openClerkCustomerDetailsPage(1);
    onClerkCustomerDetailsPage.isVisible(1);
    onClerkCustomerDetailsPage.expectDetailsVisible(1);
  });
});
