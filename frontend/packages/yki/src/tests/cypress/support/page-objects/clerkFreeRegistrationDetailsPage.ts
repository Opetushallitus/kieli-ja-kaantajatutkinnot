import {
  getFormattedDateText,
  getFreeRegistrationBasisText,
  getFreeRegistrationKindText,
  getFreeRegistrationStatusText,
  getLanguageOfServiceText,
} from 'tests/cypress/support/utils/freeRegistration';
import { freeRegistrationDetails } from 'tests/msw/fixtures/freeRegistrationDetails';

class ClerkFreeRegistrationDetailsPage {
  elements = {
    title: () => cy.findByText('Maksuttomuuden tarkastukset'),
    getSupplementRequestTextBox: () => cy.get('#supplement-request-message'),
    commentField: () => cy.get('#comment'),
    addCommentButton: () =>
      cy.findByRole('button', { name: 'Tallenna kommentti' }),
  };

  addComment(comment: string) {
    comment && this.elements.commentField().clear().type(comment);
    this.elements.addCommentButton().click();
  }

  isVisible() {
    this.elements.title().should('be.visible');
  }

  expectDetailsVisible(id: number) {
    const details = freeRegistrationDetails[id - 1];
    if (!details) {
      throw new Error(`No free registration details found for id ${id}`);
    }
    cy.findByText(
      `${details.person.firstName} ${details.person.lastName}`,
    ).should('be.visible');
    cy.findByText(`(${details.person.socialSecurityNumber})`).should(
      'be.visible',
    );
    cy.findByText(getFreeRegistrationStatusText(details.status)).should(
      'be.visible',
    );
    cy.log(
      getFreeRegistrationBasisText(details.freeRegistrationBasis),
      details.freeRegistrationBasis,
    );
    cy.findByText(
      getFreeRegistrationBasisText(details.freeRegistrationBasis),
    ).should('be.visible');
    cy.findByText(`${details.freeRegistrationsLeft} kpl`).should('be.visible');
    cy.findByText(getLanguageOfServiceText(details.languageOfService)).should(
      'be.visible',
    );
    cy.findByText(getFreeRegistrationKindText(details.registration)).should(
      'be.visible',
    );
    cy.findByText(
      getFormattedDateText(details.supplementRequestDueDate),
    ).should('be.visible');
  }

  expectAttachmentsVisible(id: number) {
    const details = freeRegistrationDetails[id - 1];
    if (!details) {
      throw new Error(`No free registration details found for id ${id}`);
    }
    details.attachments.forEach((attachment) => {
      cy.findByText(attachment.filename).should('be.visible');
      cy.findByText(getFormattedDateText(attachment.submittedAt)).should(
        'be.visible',
      );
    });
  }

  FillOutSupplementRequest({ message }) {
    this.elements.getSupplementRequestTextBox().type(message);
  }

  expectCorrectActionButtonsVisible(id: number) {
    const details = freeRegistrationDetails[id - 1];
    if (!details) {
      throw new Error(`No free registration details found for id ${id}`);
    }

    if (details.status === 'PENDING') {
      cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).should(
        'be.visible',
      );
      cy.findByRole('button', {
        name: 'Lähetä lisätietopyyntö',
      }).should('be.visible');
      cy.findByRole('button', {
        name: 'Hylkää maksuttomuus',
      }).should('exist');
    } else if (details.status === 'APPROVED') {
      cy.findByRole('button', { name: 'Hylkää maksuttomuus' }).should(
        'be.visible',
      );
      cy.findByRole('button', {
        name: 'Hyväksy maksuttomuus',
      }).should('not.exist');
      cy.findByRole('button', {
        name: 'Lähetä lisätietopyyntö',
      }).should('not.exist');
    } else if (details.status === 'REJECTED') {
      cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).should(
        'be.visible',
      );
      cy.findByRole('button', {
        name: 'Hylkää maksuttomuus',
      }).should('not.exist');
      cy.findByRole('button', {
        name: 'Lähetä lisätietopyyntö',
      }).should('not.exist');
    } else if (
      details.status === 'SUPPLEMENT_REQUESTED' ||
      details.status === 'SUPPLEMENT_REQUEST_ANSWERED' ||
      details.status === 'SUPPLEMENT_REQUEST_EXPIRED'
    ) {
      cy.findByRole('button', { name: 'Lähetä lisätietopyyntö' }).should(
        'be.visible',
      );
      cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).should(
        'be.visible',
      );
      cy.findByRole('button', {
        name: 'Hylkää maksuttomuus',
      }).should('be.visible');
    }
  }
}

export const onClerkFreeRegistrationDetailsPage =
  new ClerkFreeRegistrationDetailsPage();
