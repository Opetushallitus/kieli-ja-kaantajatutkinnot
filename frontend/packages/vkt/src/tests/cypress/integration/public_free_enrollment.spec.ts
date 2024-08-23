import { onPublicEnrollmentPage } from 'tests/cypress/support/page-objects/publicEnrollmentPage';
import { examEventIdWithKoskiEducationDetailsFound } from 'tests/msw/fixtures/publicEnrollmentInitialisation';

describe('Public enrollment without payment', () => {
  it('is possible when suitable education credentials are returned from KOSKI', () => {
    cy.openPublicEnrollmentPage(examEventIdWithKoskiEducationDetailsFound);
    onPublicEnrollmentPage.expectStepHeading('Täytä yhteystietosi');
    onPublicEnrollmentPage.fillOutContactDetails('email', 'test@test.invalid');
    onPublicEnrollmentPage.fillOutContactDetails(
      'emailConfirmation',
      'test@test.invalid',
    );
    onPublicEnrollmentPage.fillOutContactDetails('phoneNumber', '040112233');
    onPublicEnrollmentPage.fillOutCertificateShippingDetails('street', 'Katu');
    onPublicEnrollmentPage.fillOutCertificateShippingDetails(
      'postalCode',
      '99800',
    );
    onPublicEnrollmentPage.fillOutCertificateShippingDetails(
      'town',
      'Kaupunki',
    );
    onPublicEnrollmentPage.fillOutCertificateShippingDetails(
      'country',
      'Suomi',
    );
    onPublicEnrollmentPage.clickNext();

    onPublicEnrollmentPage.expectStepHeading('Koulutustiedot');
    onPublicEnrollmentPage.expectTextContents(
      'Tietojemme mukaan olet suorittanut tai suorittamassa seuraavan tutkinnon:',
    );
    onPublicEnrollmentPage.expectTextContents('Ylioppilastutkinto');
    onPublicEnrollmentPage.clickNext();

    onPublicEnrollmentPage.expectStepHeading('Valitse tutkinto');
    onPublicEnrollmentPage.checkEnrollmentPreviouslyEnrolledRadio(
      'previously-enrolled-no',
    );
    onPublicEnrollmentPage.enrollmentFullExamRadio();
    onPublicEnrollmentPage.clickNext();

    onPublicEnrollmentPage.expectStepHeading('Esikatsele');
    onPublicEnrollmentPage.expectPaymentSum('Maksuton');
  });
});
