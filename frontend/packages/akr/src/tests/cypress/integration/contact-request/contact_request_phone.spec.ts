import { APIEndpoints } from 'enums/api';
import {
  fillContactDetailsStep,
  onContactRequestPage,
  previewAndSendStep,
  TEST_TRANSLATOR_IDS,
  verifyTranslatorsStep,
  writeMessageStep,
} from 'tests/cypress/support/page-objects/contactRequestPage';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { onPublicTranslatorFilters } from 'tests/cypress/support/page-objects/publicTranslatorFilters';
import { onPublicTranslatorsListing } from 'tests/cypress/support/page-objects/publicTranslatorsListing';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.PublicTranslator,
    { fixture: 'public_translators_50.json' },
    () => {
      cy.usePhoneViewport();
      cy.openPublicHomePage();
    }
  );
  const isPhone = true;
  onPublicTranslatorFilters.filterByLanguagePair(isPhone, 'suomi', 'ruotsi');
  onPublicTranslatorsListing.selectTranslatorRows(TEST_TRANSLATOR_IDS);
  onPublicTranslatorsListing.openContactRequest();
});

describe('ContactRequestPage:Phone', () => {
  it('should redirect to homepage after completing the happy path on a mobile device', () => {
    verifyTranslatorsStep();
    fillContactDetailsStep();
    writeMessageStep();
    previewAndSendStep();

    runWithIntercept(APIEndpoints.ContactRequest, { statusCode: 200 }, () =>
      onContactRequestPage.submit()
    );

    onContactRequestPage.expectRequestToBeSent();
    onContactRequestPage.homepage();
    onPublicHomePage.isVisible();
  });
});
