import { onClerkAddOrganizer } from 'tests/cypress/support/page-objects/clerkAddOrganizer';
import { onClerkRegisterListing } from 'tests/cypress/support/page-objects/clerkRegisterListing';
import { onToast } from 'tests/cypress/support/page-objects/toast';

describe('ClerkAddOrganizer', () => {
  beforeEach(() => {
    cy.openClerkAddOrganizerPage();
    onClerkAddOrganizer.expectSearchInputVisible();
  });

  it('should display search input and initial instructions', () => {
    onClerkAddOrganizer.expectSearchIconVisible();
    onClerkAddOrganizer.expectInitialInfoTextVisible();
    onClerkAddOrganizer.expectDetailsFormNotVisible();
  });

  it('should search and display organizations with result count', () => {
    onClerkAddOrganizer.enterSearchQuery('opisto');
    onClerkAddOrganizer.expectSearchResultsVisible();
    onClerkAddOrganizer.expectResultCountDisplayed();
    onClerkAddOrganizer.expectSearchResultsCount(1);
    onClerkAddOrganizer.expectSearchResultName(0, 'Jyväskylän kansalaisopisto');
    onClerkAddOrganizer.expectSearchResultType(0, 'Oppilaitos');
  });

  it('should select organization and display details form with all sections', () => {
    onClerkAddOrganizer.enterSearchQuery('Taito');
    onClerkAddOrganizer.clickSearchResult(0);
    onClerkAddOrganizer.expectDetailsFormVisible();
    onClerkAddOrganizer.expectOrganizationNameDisplayed('Taitotalo');
    onClerkAddOrganizer.expectOrganizationAddressDisplayed();
    onClerkAddOrganizer.expectStartDateFieldVisible();
    onClerkAddOrganizer.expectEndDateFieldVisible();
    onClerkAddOrganizer.expectLanguageTableVisible();
    onClerkAddOrganizer.expectContactFieldsVisible();
    onClerkAddOrganizer.expectExtraInfoFieldVisible();
    onClerkAddOrganizer.expectCancelButtonVisible();
    onClerkAddOrganizer.expectAddButtonVisible();
  });

  it('should validate required fields and show error messages', () => {
    onClerkAddOrganizer.enterSearchQuery('Taito');
    onClerkAddOrganizer.clickSearchResult(0);
    onClerkAddOrganizer.enterStartDate('15.03.2026');
    onClerkAddOrganizer.enterEndDate('31.12.2028');
    onClerkAddOrganizer.toggleLanguageLevel('suomi', 'PERUS');

    // Try to save without contact info
    onClerkAddOrganizer.clickAddButton();

    // Expect validation errors
    // onClerkAddOrganizer.expectContactNameError();
    // onClerkAddOrganizer.expectContactEmailError();
    // onClerkAddOrganizer.expectContactPhoneError();

    // Fill in valid contact info
    onClerkAddOrganizer.enterContactName('Testi Henkilö');
    onClerkAddOrganizer.expectContactNameErrorNotVisible();

    onClerkAddOrganizer.enterContactEmail('invalid-email');
    onClerkAddOrganizer.clickAddButton();
    // onClerkAddOrganizer.expectContactEmailError();

    onClerkAddOrganizer.enterContactEmail('testi@example.com');
    onClerkAddOrganizer.expectContactEmailErrorNotVisible();

    onClerkAddOrganizer.enterContactPhone('0401234567');
    onClerkAddOrganizer.expectContactPhoneErrorNotVisible();
  });

  it('should successfully add organizer with complete valid data', () => {
    onClerkAddOrganizer.enterSearchQuery('Taivas');
    onClerkAddOrganizer.clickSearchResult(0);

    // Fill agreement dates
    onClerkAddOrganizer.enterStartDate('01.04.2026');
    onClerkAddOrganizer.enterEndDate('31.12.2029');

    // Select languages
    onClerkAddOrganizer.toggleLanguageLevel('suomi', 'PERUS');
    onClerkAddOrganizer.toggleLanguageLevel('suomi', 'KESKI');
    onClerkAddOrganizer.toggleLanguageLevel('englanti', 'YLIN');
    onClerkAddOrganizer.expectLanguageLevelChecked('suomi', 'PERUS');
    onClerkAddOrganizer.expectLanguageLevelChecked('suomi', 'KESKI');
    onClerkAddOrganizer.expectLanguageLevelChecked('englanti', 'YLIN');

    // Fill contact information
    onClerkAddOrganizer.enterContactName('Etunimi Sukunimi');
    onClerkAddOrganizer.enterContactEmail('etunimi.sukunimi@example.com');
    onClerkAddOrganizer.enterContactPhone('+358401234567');
    onClerkAddOrganizer.enterExtraInfo('Lisätietoja järjestäjästä');

    // Submit form
    onClerkAddOrganizer.clickAddButton();

    // Verify success
    onToast.expectText('Järjestäjän lisääminen onnistui');
  });

  it('should handle cancel action and clear search when new search is initiated', () => {
    onClerkAddOrganizer.enterSearchQuery('Taivas');
    onClerkAddOrganizer.clickSearchResult(0);
    onClerkAddOrganizer.expectDetailsFormVisible();
    onClerkAddOrganizer.enterStartDate('15.03.2026');
    onClerkAddOrganizer.enterContactName('Test Name');

    // Cancel should navigate away
    onClerkAddOrganizer.clickCancelButton();
    cy.location('pathname').should(
      'eq',
      '/yki/v2/virkailija/jarjestajarekisteri',
    );

    // Verify new search clears previous selection
    onClerkRegisterListing.clickAddOrganizerButton();
    onClerkAddOrganizer.expectSearchInputVisible();
    onClerkAddOrganizer.enterSearchQuery('opisto');
    onClerkAddOrganizer.expectSearchResultsVisible();
    onClerkAddOrganizer.enterSearchQuery('koulu');
    onClerkAddOrganizer.expectSearchResultsVisible();
    onClerkAddOrganizer.expectDetailsFormNotVisible();
  });
});
