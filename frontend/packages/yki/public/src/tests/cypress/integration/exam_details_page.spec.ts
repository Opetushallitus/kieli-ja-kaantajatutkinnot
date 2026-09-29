import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { getTestWorker } from 'tests/cypress/support/mswv2';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { WeaklyAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';
import {
  registrationFixture,
  saveRegistration,
} from 'tests/msw/registrationHandlers';
import { setMockSession } from 'tests/msw/session';

const examSessionResponse = examSessions.exam_sessions.find(
  (es) => es.id === 999,
);

if (!examSessionResponse) {
  throw new Error('Expected exam session fixture with id 999 to exist');
}

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

    return registrationFixture({
      partial_exam_type: 'ALL_PARTS',
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
    });
  } else {
    return registrationFixture({
      partial_exam_type: 'ALL_PARTS',
      is_strongly_identified,
      exam_session: examSessionResponse,
      registration_id: 1337,
      registration_kind: RegistrationKind.Admission,
      user: {
        email: 'teuvotesti@test.invalid',
      },
    });
  }
};

describe('ExamDetailsPage', () => {
  describe('allows filling registration form', () => {
    it('with credentials from Suomi.fi authentication', () => {
      saveRegistration(getInitRegistrationResponse(true));

      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      cy.contains('Teuvo').should('be.visible');
      onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
      onExamDetailsPage.fillFieldByLabel(
        'Sähköpostiosoite *',
        'test@example.invalid',
      );
      onExamDetailsPage.fillFieldByLabel(
        'Vahvista sähköpostiosoite *',
        'test@example.invalid',
      );
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();
      onExamDetailsPage.submitForm();
      cy.findByRole('heading', { name: /Ilmoittautuminen onnistui!/ }).should(
        'be.visible',
      );
      cy.location('pathname').should(
        'eq',
        AppRoutes.FreeRegistrationSuccess.replace(
          ':examSessionId',
          String(examSessionResponse.id),
        ).replace(':registrationId', '1337'),
      );
      cy.reload();
      cy.findByRole('heading', { name: /Ilmoittautuminen onnistui!/ }).should(
        'be.visible',
      );
    });

    it('by authenticating via a login link', () => {
      setMockSession(WeaklyAuthenticatedSessionResponse);
      saveRegistration(getInitRegistrationResponse(false));

      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();

      const { first_name, last_name, street_address, zip, post_office, ssn } =
        expectedSuomiFiRegistrationDetails;

      onExamDetailsPage.fillFieldByLabel('Etunimet *', first_name);
      onExamDetailsPage.fillFieldByLabel('Kutsumanimi *', first_name);
      onExamDetailsPage.fillFieldByLabel('Sukunimi *', last_name);

      onExamDetailsPage.fillFieldByLabel('Katuosoite *', street_address);
      onExamDetailsPage.fillFieldByLabel('Postinumero *', zip);
      onExamDetailsPage.fillFieldByLabel('Postitoimipaikka *', post_office);

      onExamDetailsPage.selectGender('Mies');
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectMotherTongue('suomi');

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
      setMockSession(WeaklyAuthenticatedSessionResponse);
      saveRegistration(getInitRegistrationResponse(false));

      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      const preferredName = 'Teuvo';
      onExamDetailsPage.fillFieldByLabel(
        'Kutsumanimi *',
        '   ' + preferredName + '   ',
      );
      onExamDetailsPage.fillFieldByLabel(
        'Puhelinnumero *',
        ' +358 50 123 4567  ',
      );

      // Interact with other fields to force onBlur handler to run, which will perform the actual trimming of text inputs.
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.expectFieldText('Kutsumanimi *', preferredName);
      onExamDetailsPage.expectFieldText('Puhelinnumero *', '+358501234567');
    });
  });

  describe('critical session and submitted flows', () => {
    it('does not show the registration form when the session fetch fails', () => {
      saveRegistration(getInitRegistrationResponse(true));
      getTestWorker().use(
        http.get(APIEndpoints.User, () =>
          HttpResponse.json('Server error', { status: 500 }),
        ),
      );

      cy.openExamSessionRegistrationForm(examSessionResponse.id, 1337);
      cy.findByRole('link', { name: /Takaisin aloitussivulle/i }).should(
        'be.visible',
      );
      cy.findByRole('button', { name: 'Lähetä' }).should('not.exist');
    });

    it('restores submitted state from context even when session fetch fails', () => {
      saveRegistration(
        registrationFixture({
          ...getInitRegistrationResponse(true),
          registration_id: examSessionResponse.id,
          registration_kind: RegistrationKind.Queue,
          state: RegistrationStates.Submitted,
          reservation_expires_at: null,
        }),
      );
      getTestWorker().use(
        http.get(APIEndpoints.User, () =>
          HttpResponse.json('Server error', { status: 500 }),
        ),
      );

      cy.openExamSessionRegistrationFormWithSearch(
        examSessionResponse.id,
        examSessionResponse.id,
        '?submitted=true&code=test-code&queue=true',
      );

      onExamDetailsPage.elements.submittedFormTitle().should('be.visible');
    });
  });
});
