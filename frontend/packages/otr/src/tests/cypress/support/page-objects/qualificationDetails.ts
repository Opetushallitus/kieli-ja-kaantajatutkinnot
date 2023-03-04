import { Qualification } from 'interfaces/qualification';

const rowTestId = (id: number) => `qualifications-table__id-${id}-row`;
const toggleButton = (name: string) =>
  `clerk-interpreter-overview__qualification-details__toggle-button--${name}`;

class QualificationDetails {
  elements = {
    expiredToggleButton: () => cy.findByTestId(toggleButton('expired')),
    row: (id: number) => cy.findByTestId(rowTestId(id)),
    deleteButton: (id: number) =>
      cy.findByTestId(`${rowTestId(id)}__delete-btn`),
  };

  clickExpiredToggleBtn() {
    this.elements.expiredToggleButton().click();
  }

  assertRowExists(id: number) {
    cy.get(`[data-testid=${rowTestId(id)}]`).should('exist');
  }

  assertRowDoesNotExist(id: number) {
    cy.get(`[data-testid=${rowTestId(id)}]`).should('not.exist');
  }

  expectRowToHaveText(id: number, text: string) {
    this.elements.row(id).should('contain.text', text);
  }

  clickDeleteButton(id: number) {
    this.elements.deleteButton(id).click();
  }

  expectVisibleQualifications(qualifications: Array<Partial<Qualification>>) {
    qualifications.forEach((a: Qualification) => {
      onQualificationDetails.expectRowToHaveText(a.id, a.diaryNumber);
    });
  }
}

export const onQualificationDetails = new QualificationDetails();
