import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { worker } from 'tests/msw/browser';
import { examSessions } from 'tests/msw/fixtures/examSession';

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

    return {
      is_strongly_identified,
      exam_session: examSessionResponse,
      registration_id: 1337,
      registration_kind: RegistrationKind.Admission,
      partial_exam_type: 'ALL_PARTS',
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
      partial_exam_type: 'ALL_PARTS',
      user: {
        email: 'teuvotesti@test.invalid',
      },
    };
  }
};

describe('ExamDetailsPage', () => {
  describe('allows filling registration form', () => {
    it('for free registration with credentials from Suomi.fi authentication', () => {
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
      onExamDetailsPage.fillFieldByLabel('Etunimet *', 'Teuvo Testi');
      onExamDetailsPage.fillFieldByLabel('Kutsumanimi *', 'Teuvo');
      onExamDetailsPage.fillFieldByLabel('Sukunimi *', 'Testaaja');
      onExamDetailsPage.fillFieldByLabel('Katuosoite *', 'Testikatu 1');
      onExamDetailsPage.fillFieldByLabel('Postinumero *', '00100');
      onExamDetailsPage.fillFieldByLabel('Postitoimipaikka *', 'Helsinki');
      onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
      onExamDetailsPage.selectGender('Mies');
      onExamDetailsPage.selectHasSSN(true);
      onExamDetailsPage.fillFieldByLabel('Henkilötunnus *', '030594W903B');
      onExamDetailsPage.selectNationality('Serbia');
      onExamDetailsPage.selectMotherTongue('suomi');
      onExamDetailsPage.selectCertificateLanguage('englanti');

      onExamDetailsPage.acceptTermsOfRegistration();
      onExamDetailsPage.acceptPrivacyPolicy();
      onExamDetailsPage.submitForm();
      onExamDetailsPage.isFormSubmitted();
    });

    it('shows payment terms for paid registration when all free attempts are used', () => {
      cy.useMswHandlers(
        http.post(APIEndpoints.IdentifyRegistration, () =>
          HttpResponse.json(getInitRegistrationResponse(true)),
        ),
        http.get(APIEndpoints.PublicKoskiEducations, () =>
          HttpResponse.json({
            educations: [
              { educationType: 'ylioppilastutkinto', isActive: true },
            ],
            usedFreeRegistrations: 3,
          }),
        ),
      );

      cy.openExamSessionRegistrationForm(
        examSessionResponse.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      cy.contains('Olet käyttänyt kaikki ilmaiset kerrat.').should(
        'be.visible',
      );
      cy.contains('dt', /^Tutkintomaksu$/)
        .next('dd')
        .should('have.text', '127 €');
      cy.findByRole('checkbox', {
        name: 'Hyväksyn ilmoittautumisen ja maksun ehdot *',
      })
        .closest('label')
        .should('be.visible');
    });

    it('shows the fee and payment terms for Finnish intermediate level without requesting KOSKI details', () => {
      const intermediateExamSession = examSessions.exam_sessions.find(
        (es) =>
          es.language_code === ExamLanguage.FIN &&
          es.level_code === ExamLevel.KESKI &&
          es.type === 'FULL',
      );
      if (!intermediateExamSession) {
        throw new Error('Expected a Finnish intermediate-level exam fixture');
      }
      const koskiRequest = cy.spy().as('koskiRequest');

      cy.useMswHandlers(
        http.post(APIEndpoints.IdentifyRegistration, () =>
          HttpResponse.json({
            ...getInitRegistrationResponse(true),
            exam_session: intermediateExamSession,
          }),
        ),
        http.get(APIEndpoints.PublicKoskiEducations, () => {
          koskiRequest();

          return HttpResponse.json({
            educations: [],
            usedFreeRegistrations: 0,
          });
        }),
      );

      cy.openExamSessionRegistrationForm(
        intermediateExamSession.id,
        getInitRegistrationResponse(true).registration_id,
      );
      onExamDetailsPage.isVisible();
      cy.findByRole('heading', { name: 'suomi, keskitaso' }).should(
        'be.visible',
      );
      cy.contains('dt', /^Tutkintomaksu$/)
        .next('dd')
        .should('have.text', `${intermediateExamSession.exam_fee} €`);
      cy.findByRole('checkbox', {
        name: 'Hyväksyn ilmoittautumisen ja maksun ehdot *',
      })
        .closest('label')
        .should('be.visible');
      cy.get('@koskiRequest').should('not.have.been.called');
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
    it('does not attempt identify when session fetch fails on normal registration flow', () => {
      worker.use(
        http.get(APIEndpoints.User, () =>
          HttpResponse.json('Server error', { status: 500 }),
        ),
      );

      cy.openExamSessionRegistrationForm(examSessionResponse.id, 1337);
      cy.findByRole('button', { name: 'Lähetä' }).should('not.exist');
    });

    it('continues submitted return flow even when session fetch fails', () => {
      worker.use(
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
