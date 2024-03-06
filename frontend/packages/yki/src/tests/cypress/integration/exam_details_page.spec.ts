import { APIEndpoints } from 'enums/api';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
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
      user: {
        email: 'teuvotesti@test.invalid',
      },
    };
  }
};

const handleRedirect = () => {
  // When browser attempts to logout, send browser instead directly to
  // successful submission page.
  // Note that mocking the response with msw doesn't currently work,
  // as the request to logout is sent to an absolute URL (including hostname).
  cy.intercept(
    { url: /^.*\/yki\/auth\/logout\?redirect=/, method: 'GET' },
    (req) => {
      const { redirect } = req.query;
      req.continue((res) => {
        res.send(301, {}, { location: redirect as string });
      });
    },
  );
};

describe('ExamDetailsPage', () => {
  describe('allows filling registration form', () => {
    it('with credentials from Suomi.fi authentication', () => {
      cy.openExamSessionRegistrationForm(examSessionResponse.id);
      cy.intercept('POST', APIEndpoints.InitRegistration, {
        statusCode: 200,
        body: getInitRegistrationResponse(true),
      }).as('initRegistration');
      cy.wait('@initRegistration');
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

      handleRedirect();

      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });

    it('by authenticating via a login link', () => {
      cy.openExamSessionRegistrationForm(examSessionResponse.id);
      cy.intercept('POST', APIEndpoints.InitRegistration, {
        statusCode: 200,
        body: getInitRegistrationResponse(false),
      }).as('initRegistration');
      cy.wait('@initRegistration');
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

      handleRedirect();

      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });
  });
});
