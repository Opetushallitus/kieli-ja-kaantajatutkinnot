class PublicEnrollmentPage {
  elements = {
    enrollmentDetails: () => cy.findByTestId('enrollment-details'),
    enrollmentPersonDetails: () => cy.findByTestId('enrollment-person-details'),
    enrollmentPreviewDetails: (field: string) =>
      cy.findByTestId(`enrollment-preview-${field}`),
    enrollmentPreviewBulletList: () =>
      cy.get('.public-enrollment__grid__preview__bullet-list'),
    enrollmentPreviewShippingDetails: () =>
      cy.findByTestId('enrollment-preview-certificate-shipping-details'),
    enrollmentContactDetailsField: (field: string) =>
      cy.get(`#public-enrollment__contact-details__${field}-field`),
    enrollmentContactDetailsFieldError: (field: string) =>
      cy.get(`#public-enrollment__contact-details__${field}-field-helper-text`),
    enrollmentCertificateShippingField: (field: string) =>
      cy.get(`#public-enrollment__certificate-shipping__${field}-field`),
    enrollmentCertificateShippingDetailsError: (field: string) =>
      cy.get(
        `#public-enrollment__certificate-shipping__${field}-field-helper-text`
      ),
    nextButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__next'),
    backButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__back'),
    submitButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__submit'),
    enrollmentPreviouslyEnrolledCheckbox: (checkboxName: string) =>
      cy.findByTestId(`enrollment-checkbox-${checkboxName}`).find('span>input'),
    enrollmentPreviouslyEnrolledError: () =>
      cy.get(`#has-previous-enrollment-error`),
    enrollmentFullExamCheckbox: () =>
      cy.findByTestId('enrollment-checkbox-full-exam').find('input'),
  };

  expectEnrollmentDetails(details: string) {
    this.elements.enrollmentDetails().should('have.text', details);
  }
  expectEnrollmentPersonDetails(details: string) {
    this.elements.enrollmentPersonDetails().should('have.text', details);
  }
  expectPreviewDetails(field: string, details: string) {
    this.elements.enrollmentPreviewDetails(field).should('have.text', details);
  }
  expectPreviewBulletList(position: number, details: string) {
    this.elements
      .enrollmentPreviewBulletList()
      .eq(position)
      .should('have.text', details);
  }
  expectPreviewCertificateShippingDetails(details: string) {
    this.elements
      .enrollmentPreviewShippingDetails()
      .should('have.text', details);
  }
  expectContactDetailsError(field: string, error = 'Tieto on pakollinen') {
    this.elements
      .enrollmentContactDetailsFieldError(field)
      .should('be.visible')
      .should('have.text', error);
  }
  expectContactDetailsErrorNotExist(field: string) {
    this.elements.enrollmentContactDetailsFieldError(field).should('not.exist');
  }
  expectPreviuoslyEnrolledError() {
    this.elements
      .enrollmentPreviouslyEnrolledError()
      .should('be.visible')
      .should('have.text', 'Tieto on pakollinen');
  }
  expectPreviouslyEnrolledErrorNotExist() {
    this.elements.enrollmentPreviouslyEnrolledError().should('not.exist');
  }
  expectCertificateShippingDetailsError(field: string) {
    this.elements
      .enrollmentCertificateShippingDetailsError(field)
      .should('be.visible')
      .should('have.text', 'Tieto on pakollinen');
  }
  expectCertificateShippingDetailsErrorNotExist(field: string) {
    this.elements
      .enrollmentCertificateShippingDetailsError(field)
      .should('not.exist');
  }
  fillOutContactDetails(field: string, details: string) {
    this.elements
      .enrollmentContactDetailsField(field)
      .type(`${details}{enter}`);
  }
  fillOutCertificateShippingDetails(field: string, details: string) {
    this.elements
      .enrollmentCertificateShippingField(field)
      .should('be.visible')
      .type(`${details}{enter}`);
  }
  clickNext() {
    this.elements.nextButton().should('be.visible').click();
  }
  clickBack() {
    this.elements.backButton().should('be.visible').click();
  }
  clickSubmit() {
    this.elements.submitButton().should('be.visible').click();
  }
  checkEnrollmentPreviouslyEnrolledCheckbox(checkboxName: string) {
    this.elements
      .enrollmentPreviouslyEnrolledCheckbox(checkboxName)
      .should('be.exist')
      .check();
  }
  enrollmentFullExamCheckbox() {
    this.elements.enrollmentFullExamCheckbox().should('be.exist').check();
  }
}

export const onPublicEnrollmentPage = new PublicEnrollmentPage();
