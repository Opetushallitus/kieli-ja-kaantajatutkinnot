import { QualificationStatus } from 'enums/clerkInterpreter';

class ClerkHomePage {
  elements = {
    qualificationStatusToggleFilter: (
      qualificationStatus: QualificationStatus
    ) =>
      cy.findByTestId(`clerk-interpreter-filters__btn--${qualificationStatus}`),
  };

  filterByQualificationStatus(qualificationStatus: QualificationStatus) {
    this.elements.qualificationStatusToggleFilter(qualificationStatus).click();
  }

  expectFilteredInterpretersCount(count: number) {
    cy.get('.table__head-box__pagination').should('contain.text', `/ ${count}`);
  }
}

export const onClerkHomePage = new ClerkHomePage();
