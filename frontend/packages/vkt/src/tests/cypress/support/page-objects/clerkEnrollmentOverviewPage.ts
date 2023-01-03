class ClerkEnrollmentOverviewPage {
  elements = {
    cancelEnrollmentButton: () =>
      cy.findByTestId('clerk-enrollment-details__cancel-enrollment-button'),
  };

  clickCancelEnrollmentButton() {
    this.elements.cancelEnrollmentButton().should('be.visible').click();
  }

  expectDisabledCancelEnrollmentButton() {
    this.elements.cancelEnrollmentButton().should('be.disabled');
  }
}

export const onClerkEnrollmentOverviewPage = new ClerkEnrollmentOverviewPage();
