import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints } from 'enums/api';
import { onPublicEnrollmentPage } from 'tests/cypress/support/page-objects/publicEnrollmentPage';
import { onPublicHomePage } from 'tests/cypress/support/page-objects/publicHomePage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { fixedDateForTests } from 'tests/cypress/support/utils/date';

beforeEach(() => {
  cy.openPublicEnrollmentPage(2);
});

describe('Public enrollment', () => {
  describe('to exam event with room', () => {
    it('reservation should have timer', () => {
      onPublicHomePage.expectReservationTimeLeft('30', '00');
      cy.tick(3000);
      onPublicHomePage.expectReservationTimeLeft('29', '57');
      cy.tick(30 * 60 * 1000);
      onPublicHomePage.expectReservationTimeLeft('00', '00');
    });

    it('reservation should allow renewal', () => {
      const response: PublicReservationResponse = {
        id: 1,
        expiresAt: fixedDateForTests.add(59, 'minute').format(),
        createdAt: fixedDateForTests.format(),
        renewedAt: fixedDateForTests.add(29, 'minute').format(),
        isRenewable: false,
      };

      cy.intercept('PUT', `${APIEndpoints.PublicReservation}/1/renew`, {
        statusCode: HTTPStatusCode.Ok,
        body: response,
      }).as('renewReservation');

      onPublicHomePage.expectReservationTimeLeft('30', '00');
      cy.tick(29 * 60 * 1000);
      onPublicHomePage.clickReservationRenewButton();
      cy.wait('@renewReservation');
      cy.tick(30 * 1000);
      onPublicHomePage.expectReservationTimeLeft('29', '30');
    });

    it('reservation expired should display info modal', () => {
      cy.tick(31 * 60 * 1000);
      onPublicHomePage.expectReservationExpiredOkButtonEnabled();
    });

    it('should be able to fill out enrollment info', () => {
      cy.tick(3000);

      onPublicEnrollmentPage.expectEnrollmentPersonDetails(
        'Sukunimi:TestiläEtunimet:Tessa',
      );
      onPublicEnrollmentPage.fillOutContactDetails(
        'email',
        'test@test.invalid',
      );
      onPublicEnrollmentPage.fillOutContactDetails(
        'emailConfirmation',
        'test@test.invalid',
      );
      onPublicEnrollmentPage.fillOutContactDetails('phoneNumber', '040112233');
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.checkEnrollmentPreviouslyEnrolledCheckbox(
        'previously-enrolled-no',
      );
      onPublicEnrollmentPage.enrollmentFullExamCheckbox();
      onPublicEnrollmentPage.fillOutCertificateShippingDetails(
        'street',
        'Katu',
      );
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
      onPublicEnrollmentPage.expectEnrollmentDetails(
        'Tutkinto: Ruotsi, erinomainen taitoTutkintopäivä: 22.3.2022Ilmoittautuminen sulkeutuu: 15.3.2022Paikkoja vapaana: 6',
      );
      onPublicEnrollmentPage.expectEnrollmentPersonDetails(
        'Sukunimi:TestiläEtunimet:Tessa',
      );
      onPublicEnrollmentPage.expectPreviewDetails('email', 'test@test.invalid');
      onPublicEnrollmentPage.expectPreviewDetails('phoneNumber', '040112233');
      onPublicEnrollmentPage.expectPreviewBulletList(
        0,
        'Kirjallinen taitoSuullinen taitoYmmärtämisen taito',
      );
      onPublicEnrollmentPage.expectPreviewBulletList(
        1,
        'KirjoittaminenTekstin ymmärtäminenPuhuminenPuheen ymmärtäminen',
      );
      onPublicEnrollmentPage.expectPreviewCertificateShippingDetails(
        'Katu, 99800, Kaupunki, Suomi',
      );
    });

    it('should display errors if mandatory info is missing', () => {
      cy.tick(3000);
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.expectContactDetailsError(
        'email',
        'Tieto on pakollinen',
      );
      onPublicEnrollmentPage.expectContactDetailsError(
        'emailConfirmation',
        'Tieto on pakollinen',
      );
      onPublicEnrollmentPage.expectContactDetailsError(
        'phoneNumber',
        'Tieto on pakollinen',
      );
      onPublicEnrollmentPage.fillOutContactDetails(
        'email',
        'test@test.invalid',
      );
      onPublicEnrollmentPage.expectContactDetailsErrorNotExist('email');
      onPublicEnrollmentPage.fillOutContactDetails(
        'emailConfirmation',
        'test@test.invalid',
      );
      onPublicEnrollmentPage.expectContactDetailsErrorNotExist(
        'emailConfirmation',
      );
      onPublicEnrollmentPage.expectContactDetailsErrorNotExist(
        'emailConfirmation',
      );
      onPublicEnrollmentPage.fillOutContactDetails('phoneNumber', '040112233');
      onPublicEnrollmentPage.expectContactDetailsErrorNotExist('phoneNumber');
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.expectPreviuoslyEnrolledError();
      onPublicEnrollmentPage.checkEnrollmentPreviouslyEnrolledCheckbox(
        'previously-enrolled-no',
      );
      onPublicEnrollmentPage.expectPreviouslyEnrolledErrorNotExist();

      onPublicEnrollmentPage.expectCertificateShippingDetailsError('street');
      onPublicEnrollmentPage.fillOutCertificateShippingDetails(
        'street',
        'Katu',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsErrorNotExist(
        'street',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsError(
        'postalCode',
      );
      onPublicEnrollmentPage.fillOutCertificateShippingDetails(
        'postalCode',
        '99800',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsErrorNotExist(
        'postalCode',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsError('town');
      onPublicEnrollmentPage.fillOutCertificateShippingDetails(
        'town',
        'Kaupunki',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsErrorNotExist(
        'town',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsError('country');
      onPublicEnrollmentPage.fillOutCertificateShippingDetails(
        'country',
        'Suomi',
      );
      onPublicEnrollmentPage.expectCertificateShippingDetailsErrorNotExist(
        'country',
      );
      onPublicEnrollmentPage.clickNext();

      // TODO: test when consent error handling is added
      // onPublicEnrollmentPage.clickSubmit();
    });
  });

  describe('to exam event that is full', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it.skip('WIP: allow user to enroll to the exam event', () => {});
  });

  // TODO: Enable again once auth flow is complete.
  describe('errors when enroll button is clicked on the home page', () => {
    it.skip('exam event received congestion after the home page was opened', () => {
      onPublicHomePage.clickEnrollButton(10);

      onToast.expectText('Tutkintotilaisuus on ruuhkautunut');
    });

    it.skip('registration to exam event closed after the home page was opened', () => {
      onPublicHomePage.clickEnrollButton(11);

      onToast.expectText(
        'Tutkintotilaisuuteen ilmoittautuminen on sulkeutunut',
      );
    });
  });
});
