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
      onExamDetailsPage.fillEmail('teuvotesti@test.invalid');
      onExamDetailsPage.fillEmailConfirmation('teuvotesti@test.invalid');
      onExamDetailsPage.fillTelephoneNumber('+358501234567');
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();

      // When browser attempts to logout, send browser instead directly to
      // successful submission page.
      // Note that mocking the response with msw doesn't currently work,
      // as the request to logout is sent to an absolute URL (including hostname).
      cy.intercept({ url: '/yki/auth/logout', method: 'GET' }, (req) => {
        const { redirect } = req.query;
        req.continue((res) => {
          res.send(301, {}, { location: redirect as string });
        });
      });
      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });
  });
});
