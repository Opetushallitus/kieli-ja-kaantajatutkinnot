class ExamDetailsPage {
  elements = {
    title: () =>
      cy.findByRole('heading', {
        name: 'Ilmoittaudu yleiseen kielitutkintoon (YKI)',
      }),
    submittedFormTitle: () =>
      cy.findByRole('heading', {
        name: 'Ilmoittautumislomake on lähetetty',
      }),
    textboxByLabel: (label: string) =>
      cy.findByRole('textbox', { name: label }),
    submitButton: () => cy.findByRole('button', { name: 'Lähetä' }),
    acceptTermsOfRegistrationCheckbox: () =>
      cy.findByRole('checkbox', { name: 'Hyväksyn ilmoittautumisen ehdot *' }),
    acceptPrivacyPolicyCheckbox: () =>
      cy.findByRole('checkbox', {
        name: 'Hyväksyn henkilötietojeni käsittelyn *',
      }),
    nationalitySelect: () =>
      cy.findByRole('combobox', { name: 'Kansalaisuus *' }),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  isFormSubmitted() {
    this.elements.submittedFormTitle().should('be.visible');
  }

  fillEmail(email: string) {
    this.elements.textboxByLabel('Sähköpostiosoite *').type(email);
  }

  fillEmailConfirmation(email: string) {
    this.elements.textboxByLabel('Vahvista sähköpostiosoite *').type(email);
  }

  fillTelephoneNumber(telephone: string) {
    this.elements.textboxByLabel('Puhelinnumero *').type(telephone);
  }

  selectCertificateLanguage(language: string) {
    cy.findByRole('radiogroup').findByRole('radio', { name: language }).click();
  }

  selectNationality(name: string) {
    this.elements.nationalitySelect().click();
    cy.findByRole('option', { name }).scrollIntoView();
    cy.findByRole('option', { name }).should('be.visible').click();
  }

  acceptTermsOfRegistration() {
    this.elements.acceptTermsOfRegistrationCheckbox().click();
  }

  acceptPrivacyPolicy() {
    this.elements.acceptPrivacyPolicyCheckbox().click();
  }

  submitForm() {
    this.elements.submitButton().click();
  }
}

export const onExamDetailsPage = new ExamDetailsPage();
