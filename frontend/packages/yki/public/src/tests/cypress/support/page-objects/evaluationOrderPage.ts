class EvaluationOrderPage {
  elements = {
    examinationPartCheckbox: (examinationPart: string) =>
      cy.findByRole('checkbox', { name: examinationPart }),
    submitOrderButton: () =>
      cy.findByRole('button', { name: /Siirry maksamaan/i }),
    title: () =>
      cy.findByRole('heading', { name: /Pyydä tarkistusarviointia/i }),
  };

  acceptTermsOfProcessingOfPersonalData() {
    cy.findByRole('checkbox', {
      name: 'Hyväksyn henkilötietojeni käsittelyn *',
    }).click();
  }

  expectReassessmentFee(fee: number) {
    cy.findByText('Tarkistusarvioinnin hinta yhteensä:').findByText(`${fee} €`);
  }

  fillParticipantDetails(field: string, value: string) {
    cy.findByRole('textbox', { name: field }).type(value);
  }

  isVisible() {
    this.elements.title().should('be.visible');
  }

  toggleExaminationPart(examinationPart: string) {
    this.elements.examinationPartCheckbox(examinationPart).click();
  }

  submitOrder() {
    this.elements.submitOrderButton().click();
  }
}

export const onEvaluationOrderPage = new EvaluationOrderPage();
