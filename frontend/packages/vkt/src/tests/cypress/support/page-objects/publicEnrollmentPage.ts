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
        `#public-enrollment__certificate-shipping__${field}-field-helper-text`,
      ),
    nextButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__next'),
    backButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__back'),
    submitButton: () =>
      cy.findByTestId('public-enrollment__controlButtons__submit'),
    enrollmentPreviouslyEnrolledRadio: (radioLabel: string) =>
      cy.findByTestId(`enrollment-checkbox-${radioLabel}`).find('span>input'),
    enrollmentPreviouslyEnrolledError: () =>
      cy.get(`#has-previous-enrollment-error`),
    enrollmentFullExamRadio: () =>
      cy.findByTestId('enrollment-checkbox-full-exam').find('input'),
    fullExamError: () => cy.get('#full-exam-error'),
    educationDetailsError: () => cy.get('#has-select-education-error'),
    formTextContents: () =>
      cy.get('div.public-enrollment__grid__form-container'),
    paymentSumHeading: () => cy.findByTestId('public-enrollment__payment-sum'),
    stepHeading: (heading: string) =>
      cy.findByRole('heading', { name: heading }),
    radioButton: (label: string) => cy.findByRole('radio', { name: label }),
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
  expectPreviouslyEnrolledError() {
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
  expectEducationDetailsError() {
    this.elements
      .educationDetailsError()
      .should('be.visible')
      .should('have.text', 'Tieto on pakollinen');
  }
  expectEducationDetailsErrorNotExist() {
    this.elements.educationDetailsError().should('not.exist');
  }
  expectFullExamError() {
    this.elements
      .fullExamError()
      .should('be.visible')
      .should('have.text', 'Tieto on pakollinen');
  }
  expectFullExamErrorNotExist() {
    this.elements.fullExamError().should('not.exist');
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
  checkEnrollmentPreviouslyEnrolledRadio(radioName: string) {
    this.elements
      .enrollmentPreviouslyEnrolledRadio(radioName)
      .should('be.exist')
      .check();
  }
  enrollmentFullExamRadio() {
    this.elements.enrollmentFullExamRadio().should('be.exist').check();
  }
  expectTextContents(contents: string) {
    this.elements.formTextContents().should('contain.text', contents);
  }
  expectPaymentSum(sum: string) {
    this.elements.paymentSumHeading().should('contain.text', sum);
  }
  expectStepHeading(heading: string) {
    this.elements.stepHeading(heading).should('be.visible');
  }
  selectRadioButton(label: string) {
    this.elements.radioButton(label).click();
  }
}

export const onPublicEnrollmentPage = new PublicEnrollmentPage();
