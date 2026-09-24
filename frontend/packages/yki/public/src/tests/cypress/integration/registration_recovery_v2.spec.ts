import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationStates } from 'enums/app';
import { RegistrationAPI } from 'features/registration/api/apiv2';
import { RegistrationRoutes, stepPath } from 'features/registration/routesv2';
import {
  registrationFixture,
  resetRegistrationMocks,
  saveRegistration,
} from 'features/registration/tests/handlersv2';
import { getTestWorker } from 'tests/cypress/support/mswv2';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPagev2';

const key = { examSessionId: 100, registrationId: 501 };
const submit = () =>
  cy.findByTestId('public-registration__controlButtons__submit');
const cancel = () =>
  cy.findByTestId('public-registration__controlButtons__abort');
let initCalls = 0;
const trackInit = ({ request }: { request: Request }) => {
  if (
    request.method === 'POST' &&
    new URL(request.url).pathname === RegistrationAPI.Init
  )
    initCalls++;
};
beforeEach(() => {
  resetRegistrationMocks();
  initCalls = 0;
  sessionStorage.setItem(
    'msw:yki-v2-now',
    String(Date.parse('2022-09-27T14:00:00Z')),
  );
  getTestWorker().events.on('request:start', trackInit);
  getTestWorker().use(
    http.get(APIEndpoints.PublicKoskiEducations, () =>
      HttpResponse.json({ educations: [], usedFreeRegistrations: 3 }),
    ),
  );
  cy.setCookie('cookie-consent-yki', 'true');
});
afterEach(() => {
  expect(initCalls, 'recovery never creates a reservation').to.equal(0);
  getTestWorker().events.removeListener('request:start', trackInit);
  sessionStorage.removeItem('msw:yki-v2-now');
});
const visit = (
  data = registrationFixture(),
  step: 'Register' | 'Payment' | 'Done' = 'Register',
) => {
  saveRegistration(data);
  cy.visit(stepPath(step, key));
};
const fillForm = () => {
  cy.findByTestId('registration-v2-Register').should('be.visible');
  onExamDetailsPage.fillFieldByLabel(
    'Sähköpostiosoite *',
    'edited@example.invalid',
  );
  onExamDetailsPage.fillFieldByLabel(
    'Vahvista sähköpostiosoite *',
    'edited@example.invalid',
  );
  onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358401234567');
  onExamDetailsPage.selectCertificateLanguage('englanti');
  onExamDetailsPage.acceptTermsOfRegistration();
  onExamDetailsPage.acceptPrivacyPolicy();
};

it('retries the same GET after a transient failure', () => {
  let reads = 0;
  const data = registrationFixture();
  getTestWorker().use(
    http.get(RegistrationAPI.Details, () => {
      reads++;

      return reads === 1
        ? new HttpResponse(null, { status: 503 })
        : HttpResponse.json(data);
    }),
  );
  visit(data);
  cy.findByRole('alert').should(
    'contain.text',
    'Ilmoittautumisen tietoja ei voitu ladata',
  );
  cy.findByRole('button', { name: 'Yritä uudelleen' }).click();
  cy.findByTestId('registration-v2-Register').should('be.visible');
  cy.location('pathname').should('eq', stepPath('Register', key));
  cy.then(() => expect(reads).to.equal(2));
});

for (const [error, text, terminal] of [
  ['expired', 'Paikkavarauksesi on vanhentunut.', true],
  ['closed', 'Ilmoittautumisaika on päättynyt.', true],
  ['registered', 'Olet jo ilmoittautunut YKI-testiin.', true],
  ['create_payment', 'Maksun luominen epäonnistui.', false],
  ['person_creation', 'Osallistujatietojesi tallentaminen epäonnistui.', false],
] as const) {
  it(`explains ${error} and ${terminal ? 'offers a fresh start' : 'retries with the retained form'}`, () => {
    getTestWorker().use(
      http.post(
        `${RegistrationAPI.Details}/submit`,
        () => HttpResponse.json({ error: { [error]: true } }, { status: 409 }),
        { once: true },
      ),
    );
    visit();
    fillForm();
    submit().click();
    cy.findByRole('alert').should('contain.text', text);
    onExamDetailsPage.expectFieldText('Puhelinnumero *', '+358401234567');
    onExamDetailsPage.expectFieldText(
      'Sähköpostiosoite *',
      'edited@example.invalid',
    );
    if (terminal) {
      submit().should('be.disabled');
      cy.findByRole('link', { name: 'Palaa aloitussivulle' }).click();
      cy.location('pathname').should('eq', RegistrationRoutes.Listing);
    } else {
      submit().should('not.be.disabled').click();
      cy.findByTestId('registration-v2-Payment').should('be.visible');
    }
  });
}

it('replaces a specific error with the generic message on a later network failure', () => {
  let attempts = 0;
  getTestWorker().use(
    http.post(`${RegistrationAPI.Details}/submit`, () => {
      attempts++;

      return attempts === 1
        ? HttpResponse.json(
            { error: { create_payment: true } },
            { status: 409 },
          )
        : new HttpResponse('server error', { status: 500 });
    }),
  );
  visit();
  fillForm();
  submit().click();
  cy.findByRole('alert').should('contain.text', 'Maksun luominen epäonnistui.');
  submit().click();
  cy.findByRole('alert')
    .should('not.contain.text', 'Maksun luominen epäonnistui.')
    .and('not.contain.text', 'submitFailed');
  submit().should('not.be.disabled');
});

for (const operation of ['submit', 'cancel'] as const) {
  it(`disables conflicting controls until ${operation} finishes`, () => {
    let finish!: (response: HttpResponse) => void;
    const pending = new Promise<HttpResponse>((resolve) => {
      finish = resolve;
    });
    getTestWorker().use(
      operation === 'submit'
        ? http.post(`${RegistrationAPI.Details}/submit`, () => pending)
        : http.delete(RegistrationAPI.Details, () => pending),
    );
    visit();
    fillForm();
    (operation === 'submit' ? submit() : cancel()).click();
    submit().should('be.disabled');
    cancel().should('be.disabled');
    cy.then(() => finish(HttpResponse.json({ error: {} }, { status: 500 })));
    cy.findByRole('alert').should('be.visible');
    submit().should('not.be.disabled');
    cancel().should('not.be.disabled');
    onExamDetailsPage.expectFieldText('Puhelinnumero *', '+358401234567');
  });
}

for (const status of ['PENDING', 'CANCELLED', 'PAID'] as const) {
  it(`restores ${status} payment on reload`, () => {
    const data = registrationFixture({
      state:
        status === 'PAID'
          ? RegistrationStates.Completed
          : RegistrationStates.Submitted,
      reservation_expires_at: null,
      payment: {
        status,
        url: '/mock-payment',
        due_date: '2022-09-28T14:00:00Z',
      },
    });
    const step = status === 'PAID' ? 'Done' : 'Payment';
    visit(data, step);
    cy.findByTestId(`registration-v2-${step}`).should('be.visible');
    cy.reload();
    cy.findByTestId(`registration-v2-${step}`).should('be.visible');
    if (status === 'CANCELLED') cy.findByRole('alert').should('be.visible');
    cy.findByTestId(
      `registration-v2-${status === 'PAID' ? 'Payment' : 'Done'}`,
    ).should('not.exist');
  });
}

it('rejects inconsistent success data without offering a network retry', () => {
  getTestWorker().use(
    http.get(RegistrationAPI.Details, () =>
      HttpResponse.json(
        registrationFixture({
          state: RegistrationStates.Completed,
        }),
      ),
    ),
  );
  visit(registrationFixture(), 'Done');
  cy.findByRole('alert').should(
    'contain.text',
    'Ilmoittautumisen tietoja ei voitu lukea.',
  );
  cy.findByTestId('registration-v2-Done').should('not.exist');
  cy.findByRole('button', { name: 'Yritä uudelleen' }).should('not.exist');
});

it('offers a fresh start for an expired reservation without renewing it', () => {
  visit(
    registrationFixture({ reservation_expires_at: '2022-09-27T13:59:59Z' }),
  );
  cy.findByRole('alert').should('be.visible');
  cy.findByTestId('registration-v2-Register').should('not.exist');
  cy.findByRole('link', { name: 'Palaa aloitussivulle' }).click();
  cy.location('pathname').should('eq', RegistrationRoutes.Listing);
  cy.then(() =>
    expect(
      JSON.parse(sessionStorage.getItem('msw:yki-registration-v2')!)[501]
        .reservation_expires_at,
    ).to.equal('2022-09-27T13:59:59Z'),
  );
});
