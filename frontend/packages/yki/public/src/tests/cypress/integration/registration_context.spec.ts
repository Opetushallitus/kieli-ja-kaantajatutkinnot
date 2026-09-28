import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { RegistrationContext } from 'interfaces/registrationContext';
import { getTestWorker } from 'tests/cypress/support/mswv2';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import {
  registrationFixture,
  saveRegistration,
} from 'tests/msw/registrationHandlers';
import { registrationEndpoint } from 'utils/registrationApi';

const key = { examSessionId: 100, registrationId: 501 };
const path = AppRoutes.ExamSessionRegistration.replace(
  ':examSessionId',
  '100',
).replace(':registrationId', '501');
const identifyPath = `${AppRoutes.ExamSession.replace(':examSessionId', '100')}?registrationId=501`;
const requests: Array<{ method: string; path: string }> = [];
const record = ({ request }: { request: Request }) =>
  requests.push({
    method: request.method,
    path: new URL(request.url).pathname,
  });
const calls = (method: string, path: string) =>
  requests.filter(
    (request) => request.method === method && request.path === path,
  );
const visit = (context = registrationFixture(), url = path) => {
  saveRegistration(context);
  cy.visit(url);
};
const fillForm = () => {
  onExamDetailsPage.fillFieldByLabel(
    'Sähköpostiosoite *',
    'test@example.invalid',
  );
  onExamDetailsPage.fillFieldByLabel(
    'Vahvista sähköpostiosoite *',
    'test@example.invalid',
  );
  onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358401234567');
  onExamDetailsPage.selectCertificateLanguage('englanti');
  onExamDetailsPage.acceptTermsOfRegistration();
  onExamDetailsPage.acceptPrivacyPolicy();
};
const submitted = (overrides: Partial<RegistrationContext> = {}) =>
  registrationFixture({
    state: RegistrationStates.Submitted,
    reservation_expires_at: null,
    payment: {
      url: `${registrationEndpoint(key)}/mock-payment`,
      due_date: '2022-10-01T09:00:00Z',
      status: 'PENDING',
    },
    ...overrides,
  });
beforeEach(() => {
  requests.length = 0;
  cy.setCookie('cookie-consent-yki', 'true');
  getTestWorker().events.on('request:start', record);
  getTestWorker().use(
    http.get(APIEndpoints.PublicKoskiEducations, () =>
      HttpResponse.json({ educations: [], usedFreeRegistrations: 3 }),
    ),
  );
});
afterEach(() => {
  expect(calls('POST', '/yki/api/registration/identify')).to.have.length(0);
  getTestWorker().events.removeListener('request:start', record);
});

it('reuses the init context on the existing identify page', () => {
  cy.visit(AppRoutes.Registration);
  cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');
  onPublicRegistrationPage.selectExamLanguage('suomi');
  onPublicRegistrationPage.selectExamLevel('ylin taso');
  onPublicRegistrationPage.search();
  onPublicRegistrationPage
    .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
    .findByRole('button', { name: 'Ilmoittaudu' })
    .click();
  cy.findByRole('link', { name: /Jatka ilmoittautumiseen/ }).should(
    'be.visible',
  );
  cy.then(() => {
    expect(calls('POST', APIEndpoints.InitRegistration)).to.have.length(1);
    expect(
      requests.filter(
        (request) =>
          request.method === 'GET' && /\/registration\/\d+$/.test(request.path),
      ),
    ).to.have.length(0);
  });
  cy.reload();
  cy.findByRole('link', { name: /Jatka ilmoittautumiseen/ }).should(
    'be.visible',
  );
  cy.then(() =>
    expect(
      requests.filter(
        (request) =>
          request.method === 'GET' && /\/registration\/\d+$/.test(request.path),
      ),
    ).to.have.length(1),
  );
});

it('restores the selected part and queue kind from GET after refresh', () => {
  visit(
    registrationFixture({
      partial_exam_type: 'SPEAK',
      registration_kind: RegistrationKind.Queue,
    }),
  );
  cy.findByRole('heading', { name: /Ilmoittaudu jonoon/ }).should('be.visible');
  cy.contains('b', 'Puhuminen').should('be.visible');
  cy.reload();
  cy.findByRole('heading', { name: /Ilmoittaudu jonoon/ }).should('be.visible');
  cy.contains('b', 'Puhuminen').should('be.visible');
  cy.then(() => {
    expect(calls('GET', registrationEndpoint(key))).to.have.length(2);
    expect(calls('POST', APIEndpoints.InitRegistration)).to.have.length(0);
  });
});

it('submits and restores the payment link without legacy code parameters', () => {
  visit();
  fillForm();
  onExamDetailsPage.submitForm();
  onExamDetailsPage.isFormSubmitted();
  cy.get(`a[href="${registrationEndpoint(key)}/mock-payment"]`).should(
    'be.visible',
  );
  cy.findByTestId('public-registration__reservation-timer-text').should(
    'not.exist',
  );
  cy.reload();
  onExamDetailsPage.isFormSubmitted();
  cy.get(`a[href="${registrationEndpoint(key)}/mock-payment"]`).should(
    'be.visible',
  );
  cy.then(() =>
    expect(calls('POST', `${registrationEndpoint(key)}/submit`)).to.have.length(
      1,
    ),
  );
});

it('completes the default mock payment and restores success on refresh', () => {
  visit(submitted());
  cy.get(`a[href="${registrationEndpoint(key)}/mock-payment"]`).click();
  cy.findByRole('heading', { name: 'Ilmoittautuminen onnistui!' }).should(
    'be.visible',
  );
  cy.get('[aria-current="step"]').should('contain.text', 'Valmis');
  cy.reload();
  cy.findByRole('heading', { name: 'Ilmoittautuminen onnistui!' }).should(
    'be.visible',
  );
});

it('keeps a cancelled payment available for another attempt', () => {
  visit(
    submitted({
      payment: {
        url: `${registrationEndpoint(key)}/mock-payment`,
        due_date: '2022-10-01T09:00:00Z',
        status: 'CANCELLED',
      },
    }),
  );
  cy.get(`a[href="${registrationEndpoint(key)}/mock-payment"]`).should(
    'be.visible',
  );
  cy.findByTestId('public-registration__controlButtons__submit').should(
    'not.exist',
  );
});

it('restores queue confirmation without a payment link', () => {
  visit(
    submitted({ registration_kind: RegistrationKind.Queue, payment: null }),
  );
  onExamDetailsPage.isFormSubmitted();
  cy.contains('Olet ilmoittautunut jonoon').should('be.visible');
  cy.get('a[href*="mock-payment"]').should('not.exist');
});

it('restores completed free registration using the existing success contents', () => {
  visit(
    submitted({
      state: RegistrationStates.Completed,
      is_free: true,
      payment: null,
    }),
  );
  cy.findByRole('heading', { name: 'Ilmoittautuminen onnistui!' }).should(
    'be.visible',
  );
  cy.get('a[href*="mock-payment"]').should('not.exist');
});

it('does not trust submitted flags in a URL over the context state', () => {
  visit(registrationFixture(), `${path}?submitted=true&code=old&queue=true`);
  cy.findByTestId('public-registration__controlButtons__submit').should(
    'be.visible',
  );
  cy.findByRole('heading', {
    name: /Ilmoittautumislomake on lähetetty/,
  }).should('not.exist');
});

it('returns an anonymous registration to identification and resumes after authentication', () => {
  const data = registrationFixture({
    session: { identity: null },
    user: {},
    is_strongly_identified: false,
  });
  visit(data);
  cy.location('pathname').should('eq', '/yki/tutkintotilaisuus/100');
  cy.get(`a[href="${data.authentication_urls.suomifi}"]`).should('be.visible');
  cy.window()
    .then((win) =>
      win
        .fetch(data.authentication_urls.suomifi)
        .then((response) => response.json()),
    )
    .then(({ redirect_url }) => cy.visit(redirect_url));
  cy.findByTestId('public-registration__controlButtons__submit').should(
    'be.visible',
  );
  cy.contains('Nordea').should('be.visible');
  cy.then(() =>
    expect(calls('POST', APIEndpoints.InitRegistration)).to.have.length(0),
  );
});

it('cancels the existing reservation through the new DELETE endpoint', () => {
  visit(registrationFixture(), identifyPath);
  cy.findByRole('link', { name: /Keskeytä/ }).click();
  cy.location('pathname').should('eq', AppRoutes.Registration);
  cy.then(() =>
    expect(calls('DELETE', registrationEndpoint(key))).to.have.length(1),
  );
  cy.window()
    .then((win) =>
      win.fetch(registrationEndpoint(key)).then((response) => response.json()),
    )
    .its('state')
    .should('eq', RegistrationStates.Cancelled);
});

it('shows an expired registration without creating another reservation', () => {
  visit(
    registrationFixture({
      state: RegistrationStates.Expired,
      reservation_expires_at: null,
    }),
  );
  cy.contains('Ilmoittautumislomakkeen täyttöaika on umpeutunut.').should(
    'be.visible',
  );
  cy.findByTestId('public-registration__controlButtons__submit').should(
    'not.exist',
  );
  cy.then(() =>
    expect(calls('POST', APIEndpoints.InitRegistration)).to.have.length(0),
  );
});

it('retries a failed submit with the same draft', () => {
  let submissions = 0;
  getTestWorker().use(
    http.post(APIEndpoints.SubmitRegistration, async ({ request }) => {
      submissions++;
      const body = (await request.json()) as { email: string };
      expect(body.email).to.equal('test@example.invalid');

      return submissions === 1
        ? new HttpResponse(null, { status: 503 })
        : HttpResponse.json(submitted());
    }),
  );
  visit();
  fillForm();
  onExamDetailsPage.submitForm();
  cy.findByTestId('public-registration__controlButtons__submit')
    .should('not.be.disabled')
    .click();
  onExamDetailsPage.isFormSubmitted();
  cy.then(() => expect(submissions).to.equal(2));
});

it('loads the existing payment return page using both IDs and ignores the payment status flag', () => {
  visit(
    submitted(),
    `${AppRoutes.RegistrationPaymentStatus}?id=100&registrationId=501&status=payment-success`,
  );
  cy.get(`a[href="${registrationEndpoint(key)}/mock-payment"]`).should(
    'be.visible',
  );
  cy.findByRole('heading', { name: 'Ilmoittautuminen onnistui!' }).should(
    'not.exist',
  );
});

it('does not display another registration when the requested IDs do not match', () => {
  visit(registrationFixture(), path.replace('/100/', '/101/'));
  cy.findByRole('link', { name: /Takaisin aloitussivulle/i }).should(
    'be.visible',
  );
  cy.findByTestId('public-registration__controlButtons__submit').should(
    'not.exist',
  );
  cy.then(() =>
    expect(calls('POST', APIEndpoints.InitRegistration)).to.have.length(0),
  );
});
