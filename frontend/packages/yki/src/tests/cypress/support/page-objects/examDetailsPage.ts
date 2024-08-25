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
    genderSelect: () => cy.findByRole('combobox', { name: 'Sukupuoli *' }),
    nationalitySelect: () =>
      cy.findByRole('combobox', { name: 'Kansalaisuus *' }),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  isFormSubmitted() {
    this.elements.submittedFormTitle().should('be.visible');
  }

  fillFieldByLabel(label: string, value: string) {
    this.elements.textboxByLabel(label).type(value);
  }

  expectFieldText(label: string, value: string) {
    this.elements.textboxByLabel(label).should('have.value', value);
  }

  selectCertificateLanguage(language: string) {
    cy.findByRole('group', { name: 'Millä kielellä haluat todistuksesi? *' })
      .findByRole('radio', { name: language })
      .click();
  }

  selectGender(name: string) {
    this.elements.genderSelect().click();
    cy.findByRole('option', { name }).scrollIntoView();
    cy.findByRole('option', { name }).should('be.visible').click();
  }

  selectNationality(name: string) {
    this.elements.nationalitySelect().click();
    cy.findByRole('option', { name }).scrollIntoView();
    cy.findByRole('option', { name }).should('be.visible').click();
  }

  selectHasSSN(hasSSN: boolean) {
    cy.findByRole('group', {
      name: 'Onko sinulla suomalainen henkilötunnus? *',
    })
      .findByRole('radio', { name: hasSSN ? 'Kyllä' : 'Ei' })
      .click();
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
