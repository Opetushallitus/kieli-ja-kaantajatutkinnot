import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints } from 'enums/api';
import { PublicReservationResponse } from 'interfaces/publicEnrollment';
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

    it('should show session expired modal', () => {
      // Only used in mockup server to trigger
      // logged out response
      cy.setCookie('noAuth', 'true');
      cy.wait(10);
      cy.tick(6 * 1000);
      onPublicHomePage.expectSessionExpiredModal();
    });

    it('should be able to fill out enrollment info', () => {
      cy.tick(3000);

      onPublicEnrollmentPage.expectStepHeading('Täytä yhteystietosi');
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

      onPublicEnrollmentPage.expectStepHeading('Koulutustiedot');
      onPublicEnrollmentPage.selectRadioButton(
        'Ei perustetta maksuttomalle kielitutkinnolle',
      );
      onPublicEnrollmentPage.clickNext();

      onPublicEnrollmentPage.checkEnrollmentPreviouslyEnrolledRadio(
        'previously-enrolled-no',
      );
      onPublicEnrollmentPage.enrollmentFullExamRadio();

      onPublicEnrollmentPage.clickNext();

      onPublicEnrollmentPage.expectEnrollmentDetails(
        'Tutkinto: Ruotsi, erinomainen taitoTutkintopäivä: 22.3.2022Ilmoittautuminen sulkeutuu: 15.3.2022 klo 16.00Paikkoja vapaana: 6',
      );
      onPublicEnrollmentPage.expectEnrollmentPersonDetails(
        'Sukunimi:TestiläEtunimet:Tessa',
      );
      onPublicEnrollmentPage.expectPreviewDetails('email', 'test@test.invalid');
      onPublicEnrollmentPage.expectPreviewDetails('phoneNumber', '040112233');
      // TODO
      // onPublicEnrollmentPage.expectPreviewBulletList(
      //   0,
      //   'Kirjallinen taitoSuullinen taitoYmmärtämisen taito',
      // );
      onPublicEnrollmentPage.expectPreviewBulletList(
        0,
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

      onPublicEnrollmentPage.expectStepHeading('Koulutustiedot');
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.expectEducationDetailsError();
      onPublicEnrollmentPage.selectRadioButton(
        'Ei perustetta maksuttomalle kielitutkinnolle',
      );
      onPublicEnrollmentPage.expectEducationDetailsErrorNotExist();
      onPublicEnrollmentPage.clickNext();

      onPublicEnrollmentPage.expectStepHeading('Valitse tutkinto');
      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.expectFullExamError();
      onPublicEnrollmentPage.enrollmentFullExamRadio();
      onPublicEnrollmentPage.expectFullExamErrorNotExist();

      onPublicEnrollmentPage.expectPreviouslyEnrolledError();
      onPublicEnrollmentPage.checkEnrollmentPreviouslyEnrolledRadio(
        'previously-enrolled-no',
      );
      onPublicEnrollmentPage.expectPreviouslyEnrolledErrorNotExist();

      onPublicEnrollmentPage.clickNext();
      onPublicEnrollmentPage.expectStepHeading('Esikatsele');

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
