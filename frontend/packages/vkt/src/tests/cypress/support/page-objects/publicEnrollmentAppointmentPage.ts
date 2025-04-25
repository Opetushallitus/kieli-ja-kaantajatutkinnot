class PublicEnrollmentAppointmentPage {
  elements = {
    nextButton: () => cy.findByRole('button', { name: 'Seuraava' }),
    proceedToPaymentButton: () =>
      cy.findByRole('button', { name: 'Siirry maksamaan' }),
    authenticateButton: () =>
      cy.findByRole('button', { name: /Tunnistaudu Suomi.fi:n kautta/i }),
    heading: (heading: string) => cy.findByRole('heading', { name: heading }),
    dataProtectionRegulationsCheckbox: () =>
      cy.findByRole('checkbox', {
        name: 'Olen lukenut tämän palvelun tietosuojaselosteen ja hyväksyn sen (pakollinen).',
      }),
  };

  clickNext() {
    this.elements.nextButton().click();
  }

  expectStepHeading(heading: string) {
    this.elements.heading(heading).should('be.visible');
  }

  authenticate() {
    this.elements.authenticateButton().click();
  }

  acceptEnrollmentConditions() {
    this.elements.dataProtectionRegulationsCheckbox().click();
  }

  proceedToPayment() {
    this.elements.proceedToPaymentButton().click();
  }
}

export const onPublicEnrollmentAppointmentPage =
  new PublicEnrollmentAppointmentPage();
