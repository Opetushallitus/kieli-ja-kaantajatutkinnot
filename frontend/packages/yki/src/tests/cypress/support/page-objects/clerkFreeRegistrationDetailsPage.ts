import {
  getFormattedDateText,
  getFreeRegistrationBasisText,
  getFreeRegistrationKindText,
  getFreeRegistrationStatusText,
} from 'tests/cypress/support/utils/freeRegistration';
import { freeRegistrationDetails } from 'tests/msw/fixtures/freeRegistrationDetails';

class ClerkFreeRegistrationDetailsPage {
  elements = {
    title: () => cy.findByText('Maksuttomuuden tarkastukset'),
  };

  isVisible() {
    this.elements.title().should('be.visible');
  }

  expectDetailsVisible(id: number) {
    const details = freeRegistrationDetails[id - 1];
    if (!details) {
      throw new Error(`No free registration details found for id ${id}`);
    }
    cy.findByText(details.person.fullName).should('be.visible');
    cy.findByText(`(${details.person.socialSecurityNumber})`).should(
      'be.visible',
    );
    cy.findByText(getFreeRegistrationStatusText(details.status)).should(
      'be.visible',
    );
    cy.findByText(
      getFreeRegistrationBasisText(details.freeRegistrationBasis),
    ).should('be.visible');
    cy.findByText(`${details.freeRegistrationsLeft} kpl`).should('be.visible');
    cy.findByText(`${details.languageOfCommunication}`).should('be.visible');
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

  expectActionButtonsVisible(id: number) {
    const details = freeRegistrationDetails[id - 1];
    if (!details) {
      throw new Error(`No free registration details found for id ${id}`);
    }
    cy.findByRole('button', { name: 'Hyväksy maksuttomuus' }).should(
      'be.visible',
    );
    cy.findByRole('button', {
      name: 'Lähetä täydennyspyyntö',
    }).should('be.visible');
  }
}

export const onClerkFreeRegistrationDetailsPage =
  new ClerkFreeRegistrationDetailsPage();
