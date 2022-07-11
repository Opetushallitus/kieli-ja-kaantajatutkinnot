import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';

const rowTestId = (id: number) => `authorisations-table__id-${id}-row`;
const toggleBtn = (name: string) =>
  `clerk-translator-overview__authorisation-details__toggle-btn--${name}`;

class AuthorisationDetails {
  elements = {
    authorisedToggleBtn: () => cy.findByTestId(toggleBtn('authorised')),
    expiredToggleBtn: () => cy.findByTestId(toggleBtn('expired')),
    formerVIRToggleBtn: () => cy.findByTestId(toggleBtn('formerVIR')),
    row: (id: number) => cy.findByTestId(rowTestId(id)),
    deleteBtn: (id: number) => cy.findByTestId(`${rowTestId(id)}__delete-btn`),
    publishPermissionSwitch: (id: number) =>
      cy.findByTestId(rowTestId(id)).find('input[type=checkbox]'),
  };

  clickAuthorisedToggleBtn() {
    this.elements.authorisedToggleBtn().click();
  }

  clickExpiredToggleBtn() {
    this.elements.expiredToggleBtn().click();
  }

  clickformerVIRToggleBtn() {
    this.elements.formerVIRToggleBtn().click();
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

  switchPublishPermission(id: number) {
    this.elements.publishPermissionSwitch(id).click();
  }

  expectPublishPermission(id: number, publishPermission: boolean) {
    const value = publishPermission ? 'on' : 'off';
    this.elements.publishPermissionSwitch(id).should('be.have', value);
  }

  clickDeleteButton(id: number) {
    this.elements.deleteBtn(id).click();
  }

  expectVisibleAuthorisations(authorisations: Array<Partial<Authorisation>>) {
    authorisations.forEach((a: Authorisation) => {
      onAuthorisationDetails.expectRowToHaveText(a.id, a.diaryNumber);
    });
  }
}

export const publishPermissionChangeResponse = (
  translatorResponse: ClerkTranslatorResponse,
  authorisationId: number,
  newPublishPermissionValue: boolean
) => {
  const updatedAuthorisations = translatorResponse.authorisations.map((a) =>
    a.id === authorisationId
      ? { ...a, permissionToPublish: newPublishPermissionValue }
      : a
  );

  return {
    ...translatorResponse,
    authorisations: updatedAuthorisations,
  };
};

export const authorisationDeletionResponse = (
  translatorResponse: ClerkTranslatorResponse,
  authorisationId: number
) => {
  const updatedAuthorisations = translatorResponse.authorisations.filter(
    (a) => a.id !== authorisationId
  );

  return {
    ...translatorResponse,
    authorisations: updatedAuthorisations,
  };
};

export const onAuthorisationDetails = new AuthorisationDetails();
