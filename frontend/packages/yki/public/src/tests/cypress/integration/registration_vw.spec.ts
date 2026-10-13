import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationDetails } from 'interfaces/publicRegistration';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import { examSessions } from 'tests/msw/fixtures/examSession';
import {
  SuomiFiAuthenticatedSessionResponse,
  WeaklyAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';
import { kieliResponse } from 'tests/msw/fixtures/kieli';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

const basePath = '/yki/ilmoittautuminen/vw';
const formPath = `${basePath}/tutkintotilaisuus/999/1338`;
const detailsPath = '/yki/v2/api/registration/999/1338';
const details: PublicRegistrationDetails = {
  ...registrationInitResponse,
  exam_session: examSessions.exam_sessions[0],
  registration_id: 1338,
  partial_exam_type: 'READ',
  registration_kind: RegistrationKind.Admission,
  expires_in: 1800,
};

const mockDetails = (overrides: Partial<PublicRegistrationDetails> = {}) => {
  cy.intercept('GET', detailsPath, { body: { ...details, ...overrides } });
};

const fillStronglyIdentifiedForm = () => {
  cy.findByRole('textbox', { name: 'Etunimet' }).should('have.value', 'Nordea');
  cy.findByRole('textbox', { name: /Sähköpostiosoite/ }).type(
    'test@example.org',
  );
  cy.findByRole('textbox', { name: /Vahvista sähköpostiosoite/ }).type(
    'test@example.org',
  );
  onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
  onExamDetailsPage.selectCertificateLanguage('englanti');
  onExamDetailsPage.acceptTermsOfRegistration();
  onExamDetailsPage.acceptPrivacyPolicy();
};

describe('Registration feature at /vw', () => {
  let requests: Array<string>;
  beforeEach(() => {
    requests = [];
    // Unregister the global MSW worker before navigation so these tests can
    // observe and stub every API request, including across full-page reloads.
    cy.then(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );
    });
    cy.intercept({ url: '/yki/**', middleware: true }, (request) => {
      requests.push(`${request.method} ${new URL(request.url).pathname}`);
    });
    cy.setCookie('cookie-consent-yki', 'true');
    cy.intercept('GET', APIEndpoints.User, {
      body: SuomiFiAuthenticatedSessionResponse,
    });
    cy.intercept('GET', APIEndpoints.ExamSessions, { body: examSessions });
    cy.intercept('GET', APIEndpoints.CountryCodes, {
      body: maatJaValtiot2Response,
    });
    cy.intercept('GET', APIEndpoints.LanguageCodes, { body: kieliResponse });
    cy.intercept('GET', APIEndpoints.OpenRegistrations, {
      body: { open_registrations: [] },
    });
    cy.intercept('GET', APIEndpoints.PublicKoskiEducations, {
      body: { educations: [], usedFreeRegistrations: 3 },
    });
    cy.intercept('GET', `${APIEndpoints.LoginLinkInfo}*`, {
      body: { expires_at: '2030-01-01T00:00:00Z' },
    });
    cy.intercept('POST', '/yki/api/public/education/1338', {
      body: { id: 1337 },
      statusCode: 201,
    });
    cy.intercept('POST', '/yki/api/registration/1338/submit*', {
      body: {
        code: 'payment-code',
        registration_kind: 'ADMISSION',
        state: 'SUBMITTED',
      },
    }).as('submit');
  });

  afterEach(() => {
    expect(requests).not.to.include(
      `POST ${APIEndpoints.IdentifyRegistration}`,
    );
    expect(requests).not.to.include('GET /yki/api/exam-session/999');
    expect(requests).not.to.include('GET /yki/api/registration/1338');
  });

  it('starts a partial registration once and restores its selected part after a refresh', () => {
    mockDetails();
    cy.intercept('POST', APIEndpoints.InitRegistration, { body: details }).as(
      'init',
    );
    cy.visit(basePath);
    cy.findByRole('combobox', { name: /^Kieli/ }).click();
    cy.findByRole('option', { name: 'suomi' }).click();
    cy.findByRole('combobox', { name: /^Taso/ }).click();
    cy.findByRole('option', { name: 'ylin taso' }).click();
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
      .findByRole('button', { name: 'Ilmoittaudu' })
      .click();
    cy.wait('@init').its('request.body').should('deep.equal', {
      exam_session_id: 999,
      to_queue: false,
      partial_exam_type: 'READ',
    });
    cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).click();
    cy.location('pathname').should('eq', formPath);
    cy.contains('dt', 'Osakokeet')
      .next('dd')
      .should('have.text', 'Tekstin ymmärtäminen');
    cy.reload();
    cy.contains('dt', 'Osakokeet')
      .next('dd')
      .should('have.text', 'Tekstin ymmärtäminen');
    cy.then(() => {
      expect(
        requests.filter((r) => r === `POST ${APIEndpoints.InitRegistration}`),
      ).to.have.length(1);
      expect(requests).to.include('GET /yki/v2/api/registration/999/1338');
    });
  });

  it('loads both IDs, submits to the existing API and reaches the payment link', () => {
    mockDetails();
    cy.visit(formPath);
    fillStronglyIdentifiedForm();
    onExamDetailsPage.submitForm();
    onExamDetailsPage.isFormSubmitted();
    cy.wait('@submit')
      .its('request.body')
      .should('include', { phone_number: '+358501234567' });
    cy.get('a[href="/yki/api/payment/v3/1338/redirect?lang=fi"]').should(
      'be.visible',
    );
    cy.findByRole('heading', { name: 'Maksupalvelutarjoaja' }).should(
      'be.visible',
    );
    cy.findByRole('link', { name: 'Ilmoittautumisen ja maksun ehdot' }).should(
      'have.attr',
      'href',
      'https://www.oph.fi/fi/koulutus-ja-tutkinnot/ilmoittautuminen-yki-testiin#anchor-ilmoittautumisen-ehdot',
    );
    cy.reload();
    onExamDetailsPage.isFormSubmitted();
    cy.get('a[href="/yki/api/payment/v3/1338/redirect?lang=fi"]').should(
      'be.visible',
    );
    cy.then(() => expect(requests).to.include(`GET ${detailsPath}`));
  });

  [false, true].forEach((isPhone) => {
    [4390, 4391].forEach((examSessionId) => {
      it(`shows session ${examSessionId} format on ${isPhone ? 'mobile' : 'desktop'} cards and registration pages`, () => {
        const digital = examSessionId === 4390;
        const label = digital ? 'Digitesti' : 'Paperitesti';
        const description = digital
          ? 'Testi tehdään testipaikalla järjestäjän tarjoamalla tietokoneella.'
          : 'Testi tehdään testipaikalla kynällä paperille.';
        const registration: PublicRegistrationDetails = {
          ...details,
          exam_session: {
            ...details.exam_session,
            id: examSessionId,
            type: 'FULL',
            available_registration_kind: RegistrationKind.Admission,
            partial_registration_kind: {
              ALL_PARTS: RegistrationKind.Admission,
            },
          },
          partial_exam_type: 'ALL_PARTS',
        };
        cy.viewport(isPhone ? 375 : 1280, 900);
        cy.intercept('GET', APIEndpoints.ExamSessions, {
          body: { exam_sessions: [registration.exam_session] },
        });
        cy.intercept('POST', APIEndpoints.InitRegistration, {
          body: registration,
        });
        cy.intercept('GET', `/yki/v2/api/registration/${examSessionId}/1338`, {
          body: registration,
        });
        cy.visit(basePath);
        onPublicRegistrationPage.selectExamLanguage('suomi', isPhone);
        onPublicRegistrationPage.selectExamLevel('ylin taso', isPhone);
        onPublicRegistrationPage.search();
        cy.get('.exam-session-format')
          .should('be.visible')
          .and('have.text', label);
        onPublicRegistrationPage
          .getResultCards()
          .findByRole('button', { name: 'Ilmoittaudu' })
          .click();
        cy.contains('dt', 'Testityyppi')
          .next('dd')
          .should('have.text', `${label} - ${description}`);
        cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).click();
        onExamDetailsPage.isVisible();
        cy.contains('dt', 'Testityyppi')
          .next('dd')
          .should('have.text', `${label} - ${description}`);
      });
    });
  });

  it('restores a submitted queue using the backend kind, without a reservation timer or payment button', () => {
    mockDetails({
      registration_kind: RegistrationKind.Queue,
      partial_exam_type: 'SPEAK',
      expires_in: undefined,
    });
    cy.visit(`${formPath}/jono?submitted=true&code=queue-code&queue=false`);
    onExamDetailsPage.isFormSubmitted();
    cy.findByTestId('public-registration__reservation-timer-text').should(
      'not.exist',
    );
    cy.findByRole('button', { name: /Siirry maksamaan/ }).should('not.exist');
    cy.then(() => expect(requests).to.include(`GET ${detailsPath}`));
  });

  it('restores and submits the email form after an authentication return', () => {
    mockDetails({
      is_strongly_identified: false,
      user: { email: 'email-user@example.org' },
    });
    cy.intercept('GET', APIEndpoints.User, {
      body: WeaklyAuthenticatedSessionResponse,
    });
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    cy.findByRole('textbox', { name: 'Sähköpostiosoite' })
      .should('have.value', 'email-user@example.org')
      .and('have.attr', 'readonly');
    cy.findByRole('textbox', { name: 'Etunimet *' })
      .should('have.value', '')
      .and('not.have.attr', 'readonly');
    cy.findByRole('textbox', { name: /Vahvista sähköpostiosoite/ }).should(
      'not.exist',
    );
    onExamDetailsPage.fillFieldByLabel('Etunimet *', 'Teuvo');
    onExamDetailsPage.fillFieldByLabel('Kutsumanimi *', 'Teuvo');
    onExamDetailsPage.fillFieldByLabel('Sukunimi *', 'Testi');
    onExamDetailsPage.fillFieldByLabel('Katuosoite *', 'Testikatu 1');
    onExamDetailsPage.fillFieldByLabel('Postinumero *', '00100');
    onExamDetailsPage.fillFieldByLabel('Postitoimipaikka *', 'Helsinki');
    onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
    onExamDetailsPage.selectGender('Mies');
    onExamDetailsPage.selectNationality('Suomi');
    onExamDetailsPage.selectMotherTongue('suomi');
    onExamDetailsPage.selectHasSSN(true);
    onExamDetailsPage.fillFieldByLabel('Henkilötunnus *', '030594W903B');
    onExamDetailsPage.selectCertificateLanguage('englanti');
    onExamDetailsPage.acceptTermsOfRegistration();
    onExamDetailsPage.acceptPrivacyPolicy();
    onExamDetailsPage.submitForm();
    onExamDetailsPage.isFormSubmitted();
    cy.wait('@submit')
      .its('request.body')
      .should('include', { email: 'email-user@example.org' });
    cy.get('a[href*="/yki/auth/login?code=payment-code"]').should('be.visible');
  });

  it('completes an eligible free registration and loads details on its success page', () => {
    mockDetails();
    cy.intercept('GET', APIEndpoints.PublicKoskiEducations, {
      body: {
        educations: [{ educationType: 'ylioppilastutkinto', isActive: true }],
        usedFreeRegistrations: 0,
      },
    });
    cy.intercept('POST', '/yki/api/registration/1338/submit*', {
      body: {
        code: 'free-code',
        registration_kind: 'ADMISSION',
        state: 'COMPLETED',
      },
    });
    cy.visit(formPath);
    fillStronglyIdentifiedForm();
    onExamDetailsPage.submitForm();
    cy.location('pathname').should(
      'eq',
      `${basePath}/maksuton/999/1338/valmis`,
    );
    cy.findByRole('heading', { level: 1 }).should(
      'contain.text',
      'Ilmoittautuminen onnistui!',
    );
    cy.then(() =>
      expect(requests).to.include('POST /yki/api/public/education/1338'),
    );
  });

  it('shows a recoverable error when the details API returns 401', () => {
    cy.intercept('GET', detailsPath, { statusCode: 401, body: '' });
    cy.visit(formPath);
    cy.findByRole('link', {
      name: /Siirry valitsemaan tunnistautumistapasi/,
    }).should(
      'have.attr',
      'href',
      `${basePath}/tutkintotilaisuus/999?registrationId=1338`,
    );
    cy.findByRole('button', { name: 'Lähetä' }).should('not.exist');
  });

  it('cancels the current registration and stays on the new listing', () => {
    mockDetails();
    cy.intercept('DELETE', '/yki/api/registration/1338', {
      body: { success: true },
    }).as('cancel');
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    cy.findByTestId('public-registration__controlButtons__abort').click();
    cy.findByRole('button', {
      name: 'Kyllä, keskeytän ilmoittautumisen',
    }).click();
    cy.wait('@cancel');
    cy.location('pathname').should('eq', basePath);
    cy.findByRole('button', { name: 'Hae' }).should('be.visible');
  });

  it('shows an error instead of a form or endless loader for missing details', () => {
    cy.intercept('GET', detailsPath, { statusCode: 404, body: '' });
    cy.visit(formPath);
    cy.get(`a[href="${basePath}"]`).should('be.visible');
    cy.findByRole('button', { name: 'Lähetä' }).should('not.exist');
  });
});
