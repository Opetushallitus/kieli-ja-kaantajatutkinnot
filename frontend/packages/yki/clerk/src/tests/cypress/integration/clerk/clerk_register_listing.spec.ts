import { onClerkRegisterListing } from 'tests/cypress/support/page-objects/clerkRegisterListing';

describe('ClerkRegisterListing', () => {
  beforeEach(() => {
    cy.openClerkRegistrationPage();
  });

  it('should display the listing table with organizers', () => {
    onClerkRegisterListing.expectListingTableVisible();
    // 2 rows are visible, 2 rows are hidden (expandable)
    onClerkRegisterListing.expectOrganizerRowsCount(4);
  });

  it('should display organizer details correctly', () => {
    onClerkRegisterListing.expectOrganizerName(0, 'Taitotalo');
    onClerkRegisterListing.expectOrganizerAgreements(
      0,
      'suomi, saksa, pohjoissaame',
    );
    onClerkRegisterListing.expectOrganizerMunicipality(0, 'HELSINKI');

    onClerkRegisterListing.expectOrganizerName(2, 'Jyväskylän kansalaisopisto');
    onClerkRegisterListing.expectOrganizerAgreementExpired(2);
    onClerkRegisterListing.expectOrganizerMunicipality(2, 'JYVÄSKYLÄ');
  });

  it('should expand and collapse collapsible row', () => {
    onClerkRegisterListing.expectOrganizerRowVisible(2);
    onClerkRegisterListing.expectOrganizerRowNotVisible(3);
    onClerkRegisterListing.clickExpandRow(2);
    onClerkRegisterListing.expectOrganizerRowVisible(3);
    onClerkRegisterListing.clickExpandRow(2);
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.expectOrganizerRowVisible(1);
    onClerkRegisterListing.expectOrganizerRowNotVisible(3);
  });

  it('should display collapsible row content correctly', () => {
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.expectOrganizerAgreementDates(
      '01.01.2018 - 01.01.2029',
    );
    onClerkRegisterListing.expectLanguageProficienciesVisible();
    onClerkRegisterListing.expectLanguageProficiency(
      'Kielitutkinnotsuomi - Kaikki tasotsaksa - Ylin tasopohjoissaame - Perustaso ja keskitaso',
    );
    onClerkRegisterListing.expectContactInfo('Iida Ikola');
    onClerkRegisterListing.expectContactInfo('0101234546');
    onClerkRegisterListing.expectContactInfo('iida.ikola@amiedu.fi');
    onClerkRegisterListing.expectExtraInfo(
      'Yleinen sähköpostilista: yki@amiedu.fi',
    );
    onClerkRegisterListing.expectAdminViewButtonVisible();
    onClerkRegisterListing.expectModifyButtonVisible();
  });

  it('should display upcoming exam sessions section', () => {
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.expectUpcomingExamSessionsVisible(1);
  });

  it('should display past exam sessions inside an accordion', () => {
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.expectUpcomingExamSessionsVisible(1);
    onClerkRegisterListing.clickPastExamSessionsAccordion();
    onClerkRegisterListing.expectPastExamSessions(2);
  });

  it('should navigate to admin user view when button is clicked', () => {
    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.clickAdminViewButton();
    cy.url().should(
      'include',
      '/virkailija/jarjestajarekisteri/1.2.246.562.10.28646781493/tutkintotilaisuudet',
    );
  });

  it('should display expired agreement warning', () => {
    // Second organizer has null languages (expired agreement)
    onClerkRegisterListing.expectOrganizerAgreementExpired(2);
  });
});
