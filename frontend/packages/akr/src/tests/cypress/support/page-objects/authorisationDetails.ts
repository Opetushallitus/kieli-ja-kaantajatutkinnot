import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';

const rowTestId = (id: number) => `authorisations-table__id-${id}-row`;
const toggleBtn = (name: string) =>
  `clerk-translator-overview__authorisation-details__toggle-btn--${name}`;

class AuthorisationDetails {
  elements = {
    authorisedToggleBtn: () => cy.findByTestId(toggleBtn('effective')),
    expiredToggleBtn: () => cy.findByTestId(toggleBtn('expired')),
    formerVirToggleBtn: () => cy.findByTestId(toggleBtn('formerVir')),
    row: (id: number) => cy.findByTestId(rowTestId(id)),
    deleteBtn: (id: number) => cy.findByTestId(`${rowTestId(id)}__delete-btn`),
  };

  clickAuthorisedToggleBtn() {
    this.elements.authorisedToggleBtn().should('be.visible').click();
  }

  clickExpiredToggleBtn() {
    this.elements.expiredToggleBtn().should('be.visible').click();
  }

  clickformerVirToggleBtn() {
    this.elements.formerVirToggleBtn().should('be.visible').click();
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
    this.elements.deleteBtn(id).should('be.visible').click();
  }

  expectVisibleAuthorisations(authorisations: Array<Partial<Authorisation>>) {
    authorisations.forEach((a: Authorisation) => {
      onAuthorisationDetails.expectRowToHaveText(a.id, a.diaryNumber);
    });
  }
}

export const authorisationDeletionResponse = (
  translatorResponse: ClerkTranslatorResponse,
  effectiveAuthorisationId: number,
) => {
  const effective = translatorResponse.authorisations.effective.filter(
    (a) => a.id !== effectiveAuthorisationId,
  );

  return {
    ...translatorResponse,
    authorisations: {
      ...translatorResponse.authorisations,
      effective,
    },
  };
};

export const onAuthorisationDetails = new AuthorisationDetails();
