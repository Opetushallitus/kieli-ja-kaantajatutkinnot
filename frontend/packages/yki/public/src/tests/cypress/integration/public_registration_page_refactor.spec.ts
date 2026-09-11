import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import {
  RegistrationAPI,
  registrationEndpoint,
} from 'features/registration/api/apiv2';
import { PublicRegistrationInitResponse } from 'features/registration/modelv2';
import { RegistrationRoutes, stepPath } from 'features/registration/routesv2';
import {
  registrationFixture,
  resetRegistrationMocks,
  saveRegistration,
} from 'features/registration/tests/handlersv2';
import { getTestWorker } from 'tests/cypress/support/mswv2';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPagev2';
import { onInitRegistrationPage } from 'tests/cypress/support/page-objects/initRegistrationPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPagev2';
import { findDialogByText } from 'tests/cypress/support/utils/dialog';

const requests: Array<{ method: string; path: string }> = [];
const recordRequest = ({ request }: { request: Request }) =>
  requests.push({
    method: request.method,
    path: new URL(request.url).pathname,
  });
const calls = (method: string, path: string) =>
  requests.filter((item) => item.method === method && item.path === path);
beforeEach(() => {
  requests.length = 0;
  resetRegistrationMocks();
  sessionStorage.setItem(
    'msw:yki-v2-now',
    String(new Date('2022-09-27T16:00:00+0200').getTime()),
  );
  getTestWorker().events.on('request:start', recordRequest);
});
afterEach(() => {
  expect(
    calls('POST', APIEndpoints.IdentifyRegistration),
    'no identify POST in v2',
  ).to.have.length(0);
  getTestWorker().events.removeListener('request:start', recordRequest);
  sessionStorage.removeItem('msw:yki-v2-now');
});
const visitRegistration = (
  data: PublicRegistrationInitResponse,
  step: 'Identify' | 'Register' | 'Payment' | 'Done',
) => {
  saveRegistration(data);
  cy.setCookie('cookie-consent-yki', 'true');
  cy.visit(
    stepPath(step, {
      examSessionId: data.exam_session.id,
      registrationId: data.registration_id,
    }),
  );
  cy.findByTestId(`registration-v2-${step}`).should('be.visible');
};
const assertRead = (
  registrationId: number,
  count: number,
  examSessionId = 100,
) => {
  cy.then(() =>
    expect(
      calls('GET', registrationEndpoint({ examSessionId, registrationId })),
    ).to.have.length(count),
  );
};
const fillStrongForm = () => {
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

// MSW cannot intercept document navigations. Exercise the mocked handoff as
// a fetch, then simulate the provider's document redirect to its returned URL.
const followMockRedirect = (name: string) => {
  cy.findByRole('link', { name })
    .invoke('attr', 'href')
    .then((href) => {
      expect(href).to.be.a('string');
      cy.window()
        .then((win) => win.fetch(href!).then((result) => result.json()))
        .then(({ redirect_url }) => {
          expect(redirect_url).to.be.a('string');
          cy.visit(redirect_url);
        });
    });
};

describe('PublicRegistrationPage refactor', () => {
  beforeEach(() => {
    cy.setCookie('cookie-consent-yki', 'true');
    cy.visit(RegistrationRoutes.Listing);
    cy.findByRole('button', { name: 'Hae' }).should('not.be.disabled');
  });

  it('is visible', () => {
    onPublicRegistrationPage.isVisible();
  });

  describe('allows filtering exams', () => {
    it('but filter criteria must be selected first', () => {
      onPublicRegistrationPage.search();
      const dialogHeading = 'Valitse tutkinnon kieli ja taso';
      findDialogByText(dialogHeading).should('be.visible');
      findDialogByText(dialogHeading)
        .findByText('takaisin', { exact: false })
        .click();
      cy.findByRole('dialog').should('not.exist');
    });

    it('all results are available initially', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(13);
    });

    it('can filter by current availability', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(9);
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(6);
    });

    it('can filter by exam language and level', () => {
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(12);

      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage.expectResultsCount(4);
      onPublicRegistrationPage.expectResultCardsCount(4);
    });
  });

  describe('allows starting the exam registration process', () => {
    it('by selecting an identification method', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCards()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
    });

    it('or by continuing with current identification data if already authenticated', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCards()
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');
      cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).should(
        'be.visible',
      );
    });
  });

  describe('does not allow starting the exam registration process', () => {
    it('when already registered', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'Olet jo ilmoittautunut YKI-testiin.',
      );
    });

    it('when full', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(2)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'YKI-testi on täynnä. Voit ilmoittautua jonoon.',
      );
    });

    it('when closed', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('keskitaso');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(3)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onPublicRegistrationPage.alertModalContains(
        'Ilmoittautuminen on sulkeutunut',
      );
    });
  });

  describe('when registering for an exam on Desktop', () => {
    it('shows timer with time remaining when type is ADMISSION', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
      onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardsNth(1)
        .findByRole('button', { name: /Ilmoittaudu/ })
        .click();

      onInitRegistrationPage.expectTitle('Tunnistaudu ilmoittautumista varten');

      onPublicRegistrationPage.continueToRegister();
      onPublicRegistrationPage.expectReservationTimerText(
        true,
        /^Paikkavarauksesi YKI-testiin umpeutuu: /,
      );
    });

    it('shows the backend deadline for a STARTED queue registration', () => {
      onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
      onPublicRegistrationPage.selectExamLevel('kaikki tasot');
      onPublicRegistrationPage.search();

      onPublicRegistrationPage
        .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
        .findByRole('button', { name: 'Ilmoittaudu jonoon' })
        .click();

      onInitRegistrationPage.expectTitle(
        'Tunnistaudu jonoon ilmoittautumista varten',
      );

      onPublicRegistrationPage.continueToRegister();
      onPublicRegistrationPage.sendRegistrationButtonIsVisible();
      onPublicRegistrationPage.expectReservationTimerText(
        true,
        /^Paikkavarauksesi YKI-testiin umpeutuu: /,
      );
    });
  });
});

describe('Registration v2 route and API contract', () => {
  it('starts only on the listing click and reads once per step and refresh', () => {
    cy.setCookie('cookie-consent-yki', 'true');
    cy.visit(RegistrationRoutes.Listing);
    onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
    onPublicRegistrationPage.selectExamLevel('kaikki tasot');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCards()
      .findByRole('button', { name: 'Ilmoittaudu' })
      .first()
      .click();
    cy.findByTestId('registration-v2-Identify').should('be.visible');
    cy.location('pathname').then((path) => {
      const [examSessionId, registrationId] = path
        .split('/')
        .slice(-2)
        .map(Number);
      expect(registrationId).not.to.equal(examSessionId);
      assertRead(registrationId, 1, examSessionId);
      cy.then(() =>
        expect(calls('POST', RegistrationAPI.Init)).to.have.length(1),
      );
      cy.reload();
      cy.findByTestId('registration-v2-Identify').should('be.visible');
      assertRead(registrationId, 2, examSessionId);
      cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).click();
      cy.findByTestId('registration-v2-Register').should('be.visible');
      cy.location('pathname').should(
        'eq',
        stepPath('Register', { examSessionId, registrationId }),
      );
      cy.location('search').should('eq', '');
      assertRead(registrationId, 3, examSessionId);
      cy.then(() => {
        expect(calls('POST', RegistrationAPI.Init)).to.have.length(1);
        expect(
          calls('GET', `/yki/api/exam-session/${examSessionId}`),
        ).to.have.length(0);
        expect(
          calls('GET', `/yki/api/registration/${registrationId}`),
        ).to.have.length(0);
      });
    });
  });

  for (const [type, parts] of [
    ['FULL', ['ALL_PARTS']],
    ['READ_SPEAK', ['ALL_PARTS', 'READ', 'SPEAK']],
    ['LISTEN_WRITE', ['ALL_PARTS', 'LISTEN', 'WRITE']],
  ] as const) {
    for (const partial_exam_type of parts) {
      it(`restores ${type} / ${partial_exam_type} with one GET`, () => {
        const base = registrationFixture();
        const exam_session =
          type === 'FULL'
            ? {
                ...base.exam_session,
                type,
                partial_registration_kind: {
                  ALL_PARTS: RegistrationKind.Admission,
                },
              }
            : type === 'READ_SPEAK'
              ? {
                  ...base.exam_session,
                  type,
                  partial_registration_kind: {
                    ALL_PARTS: RegistrationKind.Queue,
                    READ: RegistrationKind.Admission,
                    SPEAK: RegistrationKind.Queue,
                  },
                }
              : {
                  ...base.exam_session,
                  type,
                  partial_registration_kind: {
                    ALL_PARTS: RegistrationKind.Queue,
                    LISTEN: RegistrationKind.Admission,
                    WRITE: RegistrationKind.Queue,
                  },
                };
        visitRegistration(
          registrationFixture({ exam_session, partial_exam_type }),
          'Register',
        );
        assertRead(501, 1);
        const labels = {
          READ: /Tekstin ymmärtäminen/i,
          SPEAK: /Puhuminen/i,
          LISTEN: /Puheen ymmärtäminen/i,
          WRITE: /Kirjoittaminen/i,
        };
        const label =
          partial_exam_type === 'ALL_PARTS'
            ? type === 'FULL'
              ? /Puheen ymmärtäminen, puhuminen, tekstin ymmärtäminen, kirjoittaminen/i
              : type === 'READ_SPEAK'
                ? /Tekstin ymmärtäminen ja puhuminen/i
                : /Puheen ymmärtäminen ja kirjoittaminen/i
            : labels[partial_exam_type];
        cy.findByTestId('registration-v2-Register')
          .contains('b', label)
          .should('be.visible');
        cy.location('search').should('eq', '');
        cy.then(() =>
          expect(calls('POST', RegistrationAPI.Init)).to.have.length(0),
        );
      });
    }
  }

  for (const method of ['suomifi', 'email']) {
    it(`mocks ${method} authentication and carries both IDs to the form`, () => {
      const data = registrationFixture({
        is_strongly_identified: false,
        session: { identity: null },
        user: {},
      });
      visitRegistration(data, 'Identify');
      if (method === 'suomifi') {
        followMockRedirect('Tunnistaudu Suomi.fi-palvelussa');
      } else {
        cy.findByRole('button', {
          name: 'Tunnistaudu sähköpostillasi',
        }).click();
        cy.findByRole('textbox', {
          name: 'Kirjoita sähköpostiosoitteesi',
        }).type('test@example.invalid');
        // MSW handles fetches only. Simulate the provider's document redirect
        // after exercising the same mocked email handoff as the form.
        cy.window()
          .then((win) =>
            win
              .fetch(
                `${data.authentication_urls.email}?email=test%40example.invalid`,
              )
              .then((response) => response.json()),
          )
          .then(({ redirect_url }) => {
            cy.intercept(
              'GET',
              '**/registration/100/501/email?email=*',
              (request) => request.redirect(redirect_url),
            );
            cy.findByRole('button', {
              name: 'tunnistaudu sähköpostilla',
            }).click();
          });
      }
      cy.findByTestId('registration-v2-Register').should('be.visible');
      cy.location('pathname').should(
        'eq',
        stepPath('Register', { examSessionId: 100, registrationId: 501 }),
      );
      cy.location('search').should('eq', '');
      assertRead(501, 2);
      if (method === 'suomifi') cy.contains('p', 'Nordea').should('be.visible');
      else
        cy.findByRole('textbox', { name: 'Etunimet *' }).should('be.visible');
      cy.then(() =>
        expect(calls('POST', RegistrationAPI.Init)).to.have.length(0),
      );
    });
  }

  it('shows translated validation errors and does not submit an incomplete form', () => {
    visitRegistration(registrationFixture(), 'Register');
    onExamDetailsPage.submitForm();
    cy.findByRole('alert')
      .should('contain.text', 'Korjaa lomakkeen virheet')
      .and('not.contain.text', 'errors.');
    cy.location('pathname').should(
      'eq',
      stepPath('Register', { examSessionId: 100, registrationId: 501 }),
    );
    cy.then(() =>
      expect(
        calls(
          'POST',
          `${registrationEndpoint({ examSessionId: 100, registrationId: 501 })}/submit`,
        ),
      ).to.have.length(0),
    );
    assertRead(501, 1);
  });

  it('submits paid admission, loads Payment, and returns to Done without query flags', () => {
    getTestWorker().use(
      http.get(APIEndpoints.PublicKoskiEducations, () =>
        HttpResponse.json({ educations: [], usedFreeRegistrations: 3 }),
      ),
    );
    visitRegistration(registrationFixture(), 'Register');
    fillStrongForm();
    onExamDetailsPage.submitForm();
    cy.findByTestId('registration-v2-Payment').should('be.visible');
    assertRead(501, 2);
    cy.location('search').should('eq', '');
    cy.reload();
    cy.findByTestId('registration-v2-Payment').should('be.visible');
    assertRead(501, 3);
    followMockRedirect('Maksa tutkintomaksu');
    cy.findByTestId('registration-v2-Done').should('be.visible');
    cy.location('pathname').should(
      'eq',
      stepPath('Done', { examSessionId: 100, registrationId: 501 }),
    );
    cy.location('search').should('eq', '');
    assertRead(501, 4);
    cy.reload();
    cy.findByTestId('registration-v2-Done').should('be.visible');
    assertRead(501, 5);
    cy.then(() =>
      expect(
        calls(
          'POST',
          `${registrationEndpoint({ examSessionId: 100, registrationId: 501 })}/submit`,
        ),
      ).to.have.length(1),
    );
  });

  for (const queued of [false, true]) {
    it(`submits free ${queued ? 'queue' : 'admission'} directly to Done and restores it on reload`, () => {
      visitRegistration(
        registrationFixture({
          registration_kind: queued
            ? RegistrationKind.Queue
            : RegistrationKind.Admission,
        }),
        'Register',
      );
      fillStrongForm();
      onExamDetailsPage.submitForm();
      cy.findByTestId('registration-v2-Done').should('be.visible');
      cy.location('search').should('eq', '');
      assertRead(501, 2);
      cy.reload();
      cy.findByTestId('registration-v2-Done').should('be.visible');
      assertRead(501, 3);
      cy.findByRole('link', { name: 'Maksa tutkintomaksu' }).should(
        'not.exist',
      );
    });
  }

  it('uses the exact part from the other-started-registration modal when explicitly initializing', () => {
    const data = registrationFixture({
      registration_id: 502,
      partial_exam_type: 'SPEAK',
      registration_kind: RegistrationKind.Queue,
    });
    saveRegistration(data);
    let attempts = 0;
    const bodies: unknown[] = [];
    getTestWorker().use(
      http.post(RegistrationAPI.Init, async ({ request }) => {
        attempts++;
        bodies.push(await request.json());
        if (attempts === 1)
          return HttpResponse.json(
            {
              error: {
                'other-exam-session-registration': {
                  id: 100,
                  registration_id: 502,
                  state: 'STARTED',
                  partial_exam_type: 'SPEAK',
                  kind: 'QUEUE',
                },
              },
            },
            { status: 409 },
          );

        return HttpResponse.json(data);
      }),
    );
    cy.setCookie('cookie-consent-yki', 'true');
    cy.visit(RegistrationRoutes.Listing);
    onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
    onPublicRegistrationPage.selectExamLevel('kaikki tasot');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCards()
      .findByRole('button', { name: 'Ilmoittaudu' })
      .first()
      .click();
    cy.findByRole('button', {
      name: /Siirry ilmoittautumislomakkeelle/i,
    }).click();
    cy.findByTestId('registration-v2-Identify').should('be.visible');
    cy.location('pathname').should(
      'eq',
      stepPath('Identify', { examSessionId: 100, registrationId: 502 }),
    );
    assertRead(502, 1);
    cy.then(() => {
      expect(attempts).to.equal(2);
      expect(bodies[1]).to.deep.equal({
        exam_session_id: 100,
        partial_exam_type: 'SPEAK',
        to_queue: true,
      });
    });
  });

  it('cancels registration 502 after refresh rather than its session or previous registration', () => {
    const data = registrationFixture({
      registration_id: 502,
      partial_exam_type: 'SPEAK',
      registration_kind: RegistrationKind.Queue,
    });
    visitRegistration(data, 'Identify');
    cy.reload();
    cy.findByTestId('registration-v2-Identify').should('be.visible');
    cy.findByRole('button', { name: 'Keskeytä ilmoittautuminen' }).click();
    cy.location('pathname').should('eq', RegistrationRoutes.Listing);
    cy.then(() =>
      expect(
        calls(
          'DELETE',
          registrationEndpoint({ examSessionId: 100, registrationId: 502 }),
        ),
      ).to.have.length(1),
    );
  });

  for (const status of [401, 403, 404, 500]) {
    it(`offers a fresh start when the details GET returns ${status}`, () => {
      getTestWorker().use(
        http.get(
          RegistrationAPI.Details,
          () => new HttpResponse(null, { status }),
        ),
      );
      cy.setCookie('cookie-consent-yki', 'true');
      cy.visit(
        stepPath('Register', { examSessionId: 100, registrationId: 501 }),
      );
      cy.findByRole('alert').should('be.visible');
      cy.findByRole('link', { name: 'Palaa aloitussivulle' }).click();
      cy.location('pathname').should('eq', RegistrationRoutes.Listing);
      assertRead(501, 1);
      cy.then(() =>
        expect(calls('POST', RegistrationAPI.Init)).to.have.length(0),
      );
    });
  }

  it('loads the same registration and controls on mobile', () => {
    cy.viewport('iphone-x');
    visitRegistration(registrationFixture(), 'Identify');
    cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).click();
    cy.findByTestId('registration-v2-Register').should('be.visible');
    cy.findByTestId('public-registration__controlButtons__submit')
      .scrollIntoView()
      .should('be.visible');
    assertRead(501, 2);
  });

  it('does not claim success from URL query flags on a STARTED registration', () => {
    saveRegistration(registrationFixture());
    cy.setCookie('cookie-consent-yki', 'true');
    cy.visit(
      `${stepPath('Done', { examSessionId: 100, registrationId: 501 })}?submitted=true&queue=true&status=payment-success&code=fake`,
    );
    cy.findByTestId('registration-v2-Register').should('be.visible');
    cy.location('search').should('eq', '');
    cy.findByTestId('registration-v2-Done').should('not.exist');
  });
});
