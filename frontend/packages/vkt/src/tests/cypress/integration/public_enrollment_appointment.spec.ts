import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onPublicEnrollmentAppointmentPage } from 'tests/cypress/support/page-objects/publicEnrollmentAppointmentPage';
import {
  publicEnrollmentAppointment,
  publicEnrollmentAppointmentWithPerson,
} from 'tests/msw/fixtures/publicEnrollmentAppointment';
//import { RouteUtils } from 'utils/routes';
//import { AppRoutes } from 'enums/app';

const contactDetailsFields = [
  { label: 'Katuosoite *', value: 'Kadunkiersiö 1' },
  { label: 'Postinumero *', value: '99100' },
  { label: 'Postitoimipaikka *', value: 'Kittilä' },
  { label: 'Maa *', value: 'Suomi' },
];

describe('PublicEnrollmentAppointmentPage', () => {
  it('should require user to first authenticate through Suomi.fi', () => {
    cy.openPublicEnrollmentAppointmentPage(publicEnrollmentAppointment.id);
    onPublicEnrollmentAppointmentPage.expectStepHeading(
      'Tunnistaudu ilmoittautumista varten',
    );
  });
  it('should allow user to enroll after a successful authentication', () => {
    cy.openPublicEnrollmentAppointmentPage(
      publicEnrollmentAppointment.id,
      'tiedot',
    );
    onPublicEnrollmentAppointmentPage.expectStepHeading('Täytä yhteystietosi');

    ['lastName', 'firstName'].forEach((field) => {
      cy.findByText(publicEnrollmentAppointmentWithPerson.person[field]).should(
        'be.visible',
      );
    });
    ['email', 'phoneNumber'].forEach((field) => {
      cy.findByText(publicEnrollmentAppointmentWithPerson[field]).should(
        'be.visible',
      );
    });

    contactDetailsFields.forEach(({ label, value }) => {
      // Expect dialog to be raised if attempting to proceed without current field filled
      onPublicEnrollmentAppointmentPage.clickNext();
      onDialog.expectText('Tiedoissa on korjattavaa!');
      onDialog.clickButtonByText('Takaisin');

      cy.findByRole('textbox', { name: label }).type(value);
    });

    onPublicEnrollmentAppointmentPage.clickNext();

    onPublicEnrollmentAppointmentPage.expectStepHeading('Esikatsele ja maksa');
    cy.findByText('Koko tutkinto').should('be.visible');
    cy.findByText('280€').should('be.visible');

    onPublicEnrollmentAppointmentPage.proceedToPayment();

    onDialog.expectText('Tiedoissa on korjattavaa!');
    onDialog.clickButtonByText('Takaisin');
    onPublicEnrollmentAppointmentPage.acceptEnrollmentConditions();

    // TODO Test transition to and from Paytrail?
    // User should next be redirected to Paytrail and we assume the payment goes through.
    // However, intercepting the redirect seems harder than expected, as it's performed by setting
    // window.location.href (after a timeout).
    // Setting up msw handlers or Cypress intercepts to work around this didn't seem to work.

    // onPublicEnrollmentAppointmentPage.proceedToPayment();
    // TODO Figure out how to test transition to and from Paytrail
    // onPublicEnrollmentAppointmentPage.expectStepHeading('Maksu suoritettu');
  });
});
