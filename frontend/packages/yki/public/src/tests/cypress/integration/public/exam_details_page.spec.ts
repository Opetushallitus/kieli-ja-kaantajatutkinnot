import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { worker } from 'tests/msw/browser';
import { examSessions } from 'tests/msw/fixtures/examSession';

const examSessionResponse = examSessions.exam_sessions.find(
  (es) => es.id === 999,
);

const expectedSuomiFiRegistrationDetails = {
  first_name: 'Teuvo',
  last_name: 'Testitapaus',
  ssn: '030594W903B',
  post_office: 'Helsinki',
  zip: '00100',
  street_address: 'Unioninkatu 1',
};

const getInitRegistrationResponse = (is_strongly_identified: boolean) => {
  if (is_strongly_identified) {
    const { first_name, last_name, ssn, post_office, zip, street_address } =
      expectedSuomiFiRegistrationDetails;

    return {
      is_strongly_identified,
      exam_session: examSessionResponse,
      registration_id: 1337,
      registration_kind: RegistrationKind.Admission,
      user: {
        first_name,
        last_name,
        ssn,
        post_office,
        zip,
        street_address,
      },
    };
  } else {
    return {
      is_strongly_identified,
      exam_session: examSessionResponse,
      registration_id: 1337,
      registration_kind: RegistrationKind.Admission,
      user: {
        email: 'teuvotesti@test.invalid',
      },
    };
  }
};

describe('ExamDetailsPage', () => {
  describe('allows filling registration form', () => {
    if (!examSessionResponse) {
      throw 'examSessionResponse does not have a value';
    }

    it('with credentials from Suomi.fi authentication', () => {
      worker.use(
        http.post(APIEndpoints.IdentifyRegistration, () =>
          HttpResponse.json(getInitRegistrationResponse(true)),
        ),
      );
      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      onExamDetailsPage.fillFieldByLabel(
        'Sähköpostiosoite *',
        'teuvotesti@test.invalid',
      );
      onExamDetailsPage.fillFieldByLabel(
        'Vahvista sähköpostiosoite *',
        'teuvotesti@test.invalid',
      );
      onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();

      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });

    it('by authenticating via a login link', () => {
      worker.use(
        http.post(APIEndpoints.IdentifyRegistration, () =>
          HttpResponse.json(getInitRegistrationResponse(false)),
        ),
      );
      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();

      const { first_name, last_name, street_address, zip, post_office, ssn } =
        expectedSuomiFiRegistrationDetails;

      onExamDetailsPage.fillFieldByLabel('Etunimet *', first_name);
      onExamDetailsPage.fillFieldByLabel('Sukunimi *', last_name);

      onExamDetailsPage.fillFieldByLabel('Katuosoite *', street_address);
      onExamDetailsPage.fillFieldByLabel('Postinumero *', zip);
      onExamDetailsPage.fillFieldByLabel('Postitoimipaikka *', post_office);

      onExamDetailsPage.selectGender('Mies');
      onExamDetailsPage.selectNationality('Serbia');

      onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');

      onExamDetailsPage.selectHasSSN(true);
      onExamDetailsPage.fillFieldByLabel('Henkilötunnus *', ssn);
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();

      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });

    it('text fields filled by user are trimmed of whitespace before sending to backend', () => {
      worker.use(
        http.post(APIEndpoints.IdentifyRegistration, () =>
          HttpResponse.json(getInitRegistrationResponse(true)),
        ),
      );
      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      const email = 'teuvotesti@test.invalid';
      onExamDetailsPage.fillFieldByLabel('Sähköpostiosoite *', '   ' + email);
      onExamDetailsPage.fillFieldByLabel(
        'Vahvista sähköpostiosoite *',
        email + '   ',
      );
      onExamDetailsPage.fillFieldByLabel(
        'Puhelinnumero *',
        ' +358 50 123 4567  ',
      );

      // Interact with other fields to force onBlur handler to run, which will perform the actual trimming of text inputs.
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.expectFieldText('Sähköpostiosoite *', email);
      onExamDetailsPage.expectFieldText('Puhelinnumero *', '+358501234567');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();

      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });
  });
});
