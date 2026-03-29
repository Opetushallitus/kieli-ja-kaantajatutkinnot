class ClerkRegisterListing {
  elements = {
    listingTable: () => cy.get('table').first(),
    organizerRows: () => cy.get('tbody tr'),
    organizerRowByIndex: (index: number) => cy.get('tbody tr').eq(index),
    expandButton: (index: number) =>
      cy.get('tbody tr').eq(index).findByLabelText('expand row'),
    organizerAgreementDates: () =>
      cy.contains('Järjestäjäsopimus').parent().find('p'),
    languageProficienciesSection: () => cy.contains('Kielitutkinnot').parent(),
    contactInfoSection: () => cy.contains('Yhteystiedot').parent(),
    extraInfoSection: () => cy.contains('Lisätiedot').parent(),
    adminViewButton: () =>
      cy.contains('button', 'Tarkastele järjestäjän näkymää'),
    modifyButton: () => cy.contains('button', 'Muokkaa tietoja'),
    upcomingExamSessionsSection: () =>
      cy
        .contains('Tulevat tutkintotilaisuudet')
        .next()
        .within(() => cy.get('table tr')),
    pastExamSessionsAccordion: () =>
      cy.findByTestId('clerk-register__past-exam-sessions-accordion'),
    pastExamSessions: () =>
      cy.findByTestId('clerk-register__past-exam-sessions'),
    errorMessage: () => cy.contains('Järjestäjien hakeminen epäonnistui'),
    agreementExpiredWarning: () => cy.contains('Sopimus vanhentunut'),
    addOrganizerButton: () =>
      cy.findByRole('button', { name: 'Lisää järjestäjä' }),
  };

  expectListingTableVisible() {
    this.elements.listingTable().should('be.visible');
  }

  expectOrganizerRowsCount(count: number) {
    this.elements.organizerRows().should('have.length', count);
  }

  expectOrganizerName(index: number, name: string) {
    this.elements
      .organizerRowByIndex(index)
      .find('td')
      .first()
      .should('contain.text', name);
  }

  expectOrganizerAgreements(index: number, agreements: string) {
    this.elements
      .organizerRowByIndex(index)
      .find('td')
      .eq(1)
      .should('contain.text', agreements);
  }

  expectOrganizerMunicipality(index: number, municipality: string) {
    this.elements
      .organizerRowByIndex(index)
      .find('td')
      .eq(2)
      .should('contain.text', municipality);
  }

  expectOrganizerAgreementExpired(index: number) {
    this.elements
      .organizerRowByIndex(index)
      .find('td')
      .eq(1)
      .within(() => {
        cy.contains('Sopimus vanhentunut').should('exist');
      });
  }

  clickExpandRow(index: number) {
    this.elements.expandButton(index).click();
  }

  expectOrganizerRowVisible(index: number) {
    this.elements.organizerRowByIndex(index).should('be.visible');
  }

  expectOrganizerRowNotVisible(index: number) {
    this.elements.organizerRowByIndex(index).should('not.be.visible');
  }

  expectOrganizerAgreementDates(dates: string) {
    this.elements.organizerAgreementDates().should('contain.text', dates);
  }

  expectLanguageProficienciesVisible() {
    this.elements.languageProficienciesSection().should('be.visible');
  }

  expectLanguageProficiency(proficiency: string) {
    this.elements
      .languageProficienciesSection()
      .should('contain.text', proficiency);
  }

  expectContactInfo(info: string) {
    this.elements.contactInfoSection().should('contain.text', info);
  }

  expectExtraInfo(info: string) {
    this.elements.extraInfoSection().should('contain.text', info);
  }

  expectAdminViewButtonVisible() {
    this.elements.adminViewButton().should('be.visible');
  }

  expectModifyButtonVisible() {
    this.elements.modifyButton().should('be.visible');
  }

  clickAdminViewButton() {
    this.elements.adminViewButton().click();
  }

  clickModifyButton() {
    this.elements.modifyButton().click();
  }

  clickAddOrganizerButton() {
    this.elements.addOrganizerButton().click();
  }

  expectUpcomingExamSessionsVisible(amount: number) {
    this.elements.upcomingExamSessionsSection().and('have.length', amount);
  }

  expectPastExamSessions(numberOfSessions: number) {
    this.elements.pastExamSessions().should('be.visible');
    this.elements.pastExamSessions().within(() => {
      cy.get('tbody tr').should('have.length', numberOfSessions);
    });
  }

  clickPastExamSessionsAccordion() {
    this.elements.pastExamSessionsAccordion().click();
  }

  expectErrorMessageVisible() {
    this.elements.errorMessage().should('be.visible');
  }
}

export const onClerkRegisterListing = new ClerkRegisterListing();
