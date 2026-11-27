import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { ExamLevel, RegistrationKind } from 'enums/app';
import { PublicRegistrationDetails } from 'interfaces/publicRegistration';
import { onExamDetailsPage } from 'tests/cypress/support/page-objects/examDetailsPage';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import { examSessions } from 'tests/msw/fixtures/examSession';
import {
  NoSessionResponse,
  SuomiFiAuthenticatedSessionResponse,
  WeaklyAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';
import { kieliResponse } from 'tests/msw/fixtures/kieli';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

const basePath = '/yki/ilmoittautuminen/v2';
const formPath = `${basePath}/tutkintotilaisuus/999/1338`;
const initPath = APIEndpoints.InitRegistrationV2.replace(
  ':examSessionId',
  '999',
);
const detailsPath = APIEndpoints.RegistrationDetails.replace(
  ':examSessionId',
  '999',
).replace(':registrationId', '1338');
const submitPath = APIEndpoints.SubmitRegistrationV2.replace(
  ':examSessionId',
  '999',
).replace(':registrationId', '1338');
const paymentPath =
  '/yki/api/v2/examSession/999/registration/1338/payment/redirect?lang=fi';
const details: PublicRegistrationDetails = {
  ...registrationInitResponse,
  exam_session: examSessions.exam_sessions[0],
  registration_id: 1338,
  partial_exam_type: 'READ',
  registration_kind: RegistrationKind.Admission,
  expires_in: 1800,
};

const mockDetails = (overrides: Partial<PublicRegistrationDetails> = {}) => {
  const loadDetails = cy.spy().as('loadDetails');
  cy.useMswHandlers(
    http.get(detailsPath, () => {
      loadDetails();

      return HttpResponse.json({ ...details, ...overrides });
    }),
  );
};

const submitRequestArguments = async (request: Request) => {
  const url = new URL(request.url);

  return {
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams),
    body: await request.json(),
  };
};

const fillStronglyIdentifiedForm = (isFree: boolean) => {
  cy.findByRole('textbox', { name: 'Etunimet' }).should('have.value', 'Nordea');
  cy.findByRole('textbox', { name: /Sähköpostiosoite/ }).type(
    'test@example.org',
  );
  cy.findByRole('textbox', { name: /Vahvista sähköpostiosoite/ }).type(
    'test@example.org',
  );
  onExamDetailsPage.fillFieldByLabel('Puhelinnumero *', '+358501234567');
  onExamDetailsPage.selectCertificateLanguage('englanti');
  onExamDetailsPage.acceptTermsOfRegistration(isFree);
  onExamDetailsPage.acceptPrivacyPolicy();
};

describe('Registration feature at /v2', () => {
  beforeEach(() => {
    const legacyRequest = cy.spy().as('legacyRequest');
    const submit = cy.spy().as('submit');
    const rejectLegacyRequest = ({ request }: { request: Request }) => {
      legacyRequest(`${request.method} ${new URL(request.url).pathname}`);

      return HttpResponse.error();
    };
    cy.setCookie('cookie-consent-yki', 'true');
    cy.useMswHandlers(
      http.post(APIEndpoints.InitRegistration, rejectLegacyRequest),
      http.post(APIEndpoints.IdentifyRegistration, rejectLegacyRequest),
      http.get(APIEndpoints.ExamSession, rejectLegacyRequest),
      http.get(APIEndpoints.Registration, rejectLegacyRequest),
      http.post(APIEndpoints.SubmitRegistration, rejectLegacyRequest),
      http.get(APIEndpoints.User, () =>
        HttpResponse.json(SuomiFiAuthenticatedSessionResponse),
      ),
      http.get(APIEndpoints.ExamSessionsV2, () =>
        HttpResponse.json(examSessions),
      ),
      http.get(APIEndpoints.CountryCodes, () =>
        HttpResponse.json(maatJaValtiot2Response),
      ),
      http.get(APIEndpoints.LanguageCodes, () =>
        HttpResponse.json(kieliResponse),
      ),
      http.get(APIEndpoints.OpenRegistrations, () =>
        HttpResponse.json({ open_registrations: [] }),
      ),
      http.get(APIEndpoints.PublicKoskiEducations, () =>
        HttpResponse.json({ educations: [], usedFreeRegistrations: 3 }),
      ),
      http.get(APIEndpoints.LoginLinkInfo, () =>
        HttpResponse.json({ expires_at: '2030-01-01T00:00:00Z' }),
      ),
      http.post(APIEndpoints.PublicFreeRegistrationEducation, () =>
        HttpResponse.json({ id: 1337 }, { status: 201 }),
      ),
      http.post(submitPath, async ({ request }) => {
        submit(await submitRequestArguments(request));

        return HttpResponse.json({
          code: 'payment-code',
          registration_kind: 'ADMISSION',
          state: 'SUBMITTED',
        });
      }),
    );
  });

  afterEach(() => {
    cy.get('@legacyRequest').should('not.have.been.called');
  });

  it('starts a partial registration once and restores its selected part after a refresh', () => {
    mockDetails();
    const init = cy.spy().as('init');
    cy.useMswHandlers(
      http.post(initPath, async ({ request }) => {
        init(await request.json());

        return HttpResponse.json({ registration_id: 1338 });
      }),
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
    cy.get('@init').should('have.been.calledOnceWithExactly', {
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
    cy.get('@init').should('have.been.calledOnce');
    cy.get('@loadDetails').should('have.been.called');
  });

  it('stays on the listing after returning from identification and can start another registration', () => {
    mockDetails();
    const init = cy.spy().as('init');
    cy.useMswHandlers(
      http.post(initPath, () => {
        init();

        return HttpResponse.json({ registration_id: 1338 });
      }),
    );
    cy.visit(basePath);
    onPublicRegistrationPage.selectExamLanguage('suomi', false);
    onPublicRegistrationPage.selectExamLevel('ylin taso', false);
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
      .findByRole('button', { name: 'Ilmoittaudu' })
      .click();
    cy.get('@init').should('have.been.calledOnce');
    cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).should(
      'be.visible',
    );

    cy.go('back');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCards()
      .should('have.length.greaterThan', 0);
    cy.location('pathname').should('eq', basePath);
    onPublicRegistrationPage
      .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
      .findByRole('button', { name: 'Ilmoittaudu' })
      .click();
    cy.get('@init').should('have.been.calledTwice');
    cy.findByRole('link', { name: 'Jatka ilmoittautumiseen' }).should(
      'be.visible',
    );
  });

  it('requires search criteria and filters exam sessions by language and availability', () => {
    cy.visit(basePath);
    onPublicRegistrationPage.search();
    cy.findByRole('dialog')
      .should('contain.text', 'Valitse tutkinnon kieli ja taso')
      .findByText('takaisin', { exact: false })
      .click();

    onPublicRegistrationPage.selectExamLanguage('kaikki kielet');
    onPublicRegistrationPage.selectExamLevel('kaikki tasot');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage.expectResultsCount(13);

    onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
    onPublicRegistrationPage.search();
    onPublicRegistrationPage.expectResultsCount(9);
    onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
    onPublicRegistrationPage.search();
    onPublicRegistrationPage.expectResultsCount(6);

    onPublicRegistrationPage.toggleShowOnlyIfAvailablePlaces();
    onPublicRegistrationPage.toggleShowOnlyIfOngoingAdmission();
    onPublicRegistrationPage.selectExamLanguage('suomi');
    onPublicRegistrationPage.selectExamLevel('ylin taso');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage.expectResultsCount(4);
    onPublicRegistrationPage.expectResultCardsCount(4);
  });

  it('shows partial exam availability and starts a queue registration for the full part', () => {
    mockDetails({
      registration_kind: RegistrationKind.Queue,
      partial_exam_type: 'SPEAK',
      expires_in: undefined,
    });
    const queueInit = cy.spy().as('queueInit');
    cy.useMswHandlers(
      http.post(initPath, async ({ request }) => {
        queueInit(await request.json());

        return HttpResponse.json({ registration_id: 1338 });
      }),
    );
    cy.visit(basePath);
    onPublicRegistrationPage.selectExamLanguage('suomi');
    onPublicRegistrationPage.selectExamLevel('ylin taso');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
      .within(() => {
        cy.contains('td', 'Tekstin ymmärtäminen').should('be.visible');
        cy.contains('td', 'Puhuminen').should('be.visible');
        cy.contains('0 / 127 €').should('be.visible');
        cy.contains('0 / 43 €').should('be.visible');
        cy.contains('0 / 84 €').should('be.visible');
        cy.findByRole('button', { name: 'Ilmoittaudu jonoon' }).click();
      });
    cy.get('@queueInit').should('have.been.calledOnceWithExactly', {
      exam_session_id: 999,
      to_queue: true,
      partial_exam_type: 'SPEAK',
    });
    cy.findByRole('heading', {
      name: 'Tunnistaudu jonoon ilmoittautumista varten',
    }).should('be.visible');
    onPublicRegistrationPage.continueToRegister();
    cy.location('pathname').should('eq', `${formPath}/jono`);
    onExamDetailsPage.isVisible();
    onPublicRegistrationPage.expectReservationTimerText(false);
  });

  [
    {
      error: { full: false, closed: true, partialFull: false },
      text: 'Ilmoittautuminen on sulkeutunut',
    },
    {
      error: { full: true, closed: false, partialFull: false },
      text: 'YKI-testi on täynnä. Voit ilmoittautua jonoon.',
    },
    {
      error: {
        full: false,
        closed: false,
        partialFull: false,
        'other-exam-session-registration': {
          id: 1000,
          registration_id: 42,
          state: 'SUBMITTED',
        },
      },
      text: 'Olet jo ilmoittautunut YKI-testiin.',
    },
    {
      error: { full: true, closed: false, partialFull: true },
      text: 'YKI-testi on täynnä. Ilmoittaudu osakokeisiin erikseen',
    },
  ].forEach(({ error, text }) => {
    it(`shows the init error: ${text}`, () => {
      const initError = cy.spy().as('initError');
      cy.useMswHandlers(
        http.post(initPath, () => {
          initError();

          return HttpResponse.json({ error }, { status: 409 });
        }),
      );
      cy.visit(basePath);
      onPublicRegistrationPage.selectExamLanguage('suomi');
      onPublicRegistrationPage.selectExamLevel('ylin taso');
      onPublicRegistrationPage.search();
      onPublicRegistrationPage
        .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
        .findByRole('button', { name: 'Ilmoittaudu' })
        .click();
      cy.get('@initError').should('have.been.calledOnce');
      onPublicRegistrationPage.alertModalContains(text);
    });
  });

  it('offers Suomi.fi identification with both V2 registration IDs', () => {
    mockDetails();
    const init = cy.spy().as('init');
    cy.useMswHandlers(
      http.get(APIEndpoints.User, () => HttpResponse.json(NoSessionResponse)),
      http.post(initPath, () => {
        init();

        return HttpResponse.json({ registration_id: 1338 });
      }),
    );
    cy.visit(basePath);
    onPublicRegistrationPage.selectExamLanguage('suomi');
    onPublicRegistrationPage.selectExamLevel('ylin taso');
    onPublicRegistrationPage.search();
    onPublicRegistrationPage
      .getResultCardContaining('Tekstin ymmärtäminen ja puhuminen')
      .findByRole('button', { name: 'Ilmoittaudu' })
      .click();
    cy.get('@init').should('have.been.calledOnce');
    cy.findByRole('heading', {
      name: 'Valitse tunnistautumistapasi',
    }).should('be.visible');
    cy.findByRole('link', { name: 'Tunnistaudu Suomi.fi-palvelussa' }).should(
      'have.attr',
      'href',
      '/yki/v2/login/registration/999/1338/redirect',
    );
  });

  it('validates an email and requests a V2 identification link', () => {
    mockDetails();
    const emailLink = cy.spy().as('emailLink');
    cy.useMswHandlers(
      http.get(APIEndpoints.User, () => HttpResponse.json(NoSessionResponse)),
      http.post(APIEndpoints.LoginLinkV2, async ({ request }) => {
        emailLink(await submitRequestArguments(request));

        return new HttpResponse(null, { status: 200 });
      }),
    );
    cy.visit(`${basePath}/tutkintotilaisuus/999?registrationId=1338`);
    cy.findByRole('button', { name: 'Tunnistaudu sähköpostillasi' }).click();
    cy.findByRole('button', { name: 'Tunnistaudu sähköpostilla' }).click();
    cy.findByRole('dialog')
      .should('contain.text', 'Tarkista sähköpostiosoite.')
      .findByRole('button')
      .click();
    cy.get('@emailLink').should('not.have.been.called');
    cy.findByRole('textbox', { name: 'Kirjoita sähköpostiosoitteesi' }).type(
      'email-user@example.org',
    );
    cy.findByRole('button', { name: 'Tunnistaudu sähköpostilla' }).click();
    cy.get('@emailLink').should('have.been.calledOnceWithExactly', {
      pathname: '/yki/api/v2/examSession/999/registration/1338/login-link',
      query: { lang: 'fi' },
      body: { email: 'email-user@example.org' },
    });
    cy.get('.public-registration--email-link-order__success')
      .should('be.visible')
      .and('contain.text', 'email-user@example.org');
  });

  [false, true].forEach((isPhone) => {
    it(`shows and expires the reservation timer on ${isPhone ? 'mobile' : 'desktop'}`, () => {
      cy.viewport(isPhone ? 375 : 1280, 900);
      mockDetails({ expires_in: 30 });
      cy.visit(formPath);
      onExamDetailsPage.isVisible();
      cy.findByTestId('public-registration__reservation-timer-text')
        .should('be.visible')
        .and('contain.text', '00:');
      cy.clock();
      cy.tick(31 * 1000);
      cy.findByTestId('public-registration__reservation-expired-modal').should(
        'be.visible',
      );
      cy.findByRole('button', { name: 'Palaa aloitussivulle' }).click();
      cy.location('pathname').should('eq', basePath);
    });
  });

  it('trims registration fields after editing', () => {
    mockDetails({
      is_strongly_identified: false,
      user: { email: 'email-user@example.org' },
    });
    cy.useMswHandlers(
      http.get(APIEndpoints.User, () =>
        HttpResponse.json(WeaklyAuthenticatedSessionResponse),
      ),
    );
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    onExamDetailsPage.fillFieldByLabel('Kutsumanimi *', '   Teuvo   ');
    onExamDetailsPage.fillFieldByLabel(
      'Puhelinnumero *',
      ' +358 50 123 4567  ',
    );
    onExamDetailsPage.selectNationality('Suomi');
    onExamDetailsPage.expectFieldText('Kutsumanimi *', 'Teuvo');
    onExamDetailsPage.expectFieldText('Puhelinnumero *', '+358501234567');
  });

  it('shows paid terms without requesting KOSKI for Finnish intermediate level', () => {
    mockDetails({
      exam_session: {
        ...details.exam_session,
        level_code: ExamLevel.KESKI,
        type: 'FULL',
      },
      partial_exam_type: 'ALL_PARTS',
    });
    const education = cy.spy().as('education');
    cy.useMswHandlers(
      http.get(APIEndpoints.PublicKoskiEducations, () => {
        education();

        return HttpResponse.json({ educations: [], usedFreeRegistrations: 3 });
      }),
    );
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    cy.contains('dt', /^Tutkintomaksu$/)
      .next('dd')
      .should('have.text', `${details.exam_session.exam_fee} €`);
    cy.findByRole('checkbox', {
      name: 'Hyväksyn ilmoittautumisen ja maksun ehdot *',
    })
      .closest('label')
      .should('be.visible');
    cy.get('@education').should('not.have.been.called');
  });

  it('shows paid terms when all free registration attempts are used', () => {
    mockDetails();
    const education = cy.spy().as('education');
    cy.useMswHandlers(
      http.get(APIEndpoints.PublicKoskiEducations, () => {
        education();

        return HttpResponse.json({
          educations: [{ educationType: 'ylioppilastutkinto', isActive: true }],
          usedFreeRegistrations: 3,
        });
      }),
    );
    cy.visit(formPath);
    cy.get('@education').should('have.been.calledOnce');
    cy.contains('Olet käyttänyt kaikki ilmaiset kerrat.').should('be.visible');
    cy.contains('dt', /^Tutkintomaksu$/)
      .next('dd')
      .should('have.text', '43 €');
    cy.findByRole('checkbox', {
      name: 'Hyväksyn ilmoittautumisen ja maksun ehdot *',
    })
      .closest('label')
      .should('be.visible');
  });

  it('loads both IDs, submits to the Java API and reaches the payment link', () => {
    mockDetails();
    cy.visit(formPath);
    fillStronglyIdentifiedForm(false);
    onExamDetailsPage.submitForm();
    onExamDetailsPage.isFormSubmitted();
    cy.get('@submit').should('have.been.calledOnce');
    cy.get('@submit')
      .its('firstCall.args.0')
      .should((request) => {
        expect(request.pathname).to.equal(submitPath);
        expect(request.query).to.deep.equal({ lang: 'fi' });
        expect(request.body).to.include({ phone_number: '+358501234567' });
      });
    cy.get(`a[href="${paymentPath}"]`).should('be.visible');
    cy.findByRole('heading', { name: 'Maksupalvelutarjoaja' }).should(
      'be.visible',
    );
    cy.findByRole('link', { name: 'Ilmoittautumisen ja maksun ehdot' }).should(
      'have.attr',
      'href',
      'https://www.oph.fi/fi/koulutus-ja-tutkinnot/ilmoittautuminen-yki-testiin#anchor-tutkintoon-ilmoittautumisen-ja-maksun-ehdot',
    );
    cy.reload();
    onExamDetailsPage.isFormSubmitted();
    cy.get(`a[href="${paymentPath}"]`).should('be.visible');
    cy.get('@loadDetails').should('have.been.called');
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
            session_date: '2026-11-07',
            available_registration_kind: RegistrationKind.Admission,
            partial_registration_kind: {
              ALL_PARTS: RegistrationKind.Admission,
            },
          },
          partial_exam_type: 'ALL_PARTS',
        };
        cy.viewport(isPhone ? 375 : 1280, 900);
        cy.useMswHandlers(
          http.get(APIEndpoints.ExamSessionsV2, () =>
            HttpResponse.json({ exam_sessions: [registration.exam_session] }),
          ),
          http.post(
            APIEndpoints.InitRegistrationV2.replace(
              ':examSessionId',
              `${examSessionId}`,
            ),
            () => HttpResponse.json({ registration_id: 1338 }),
          ),
          http.get(
            APIEndpoints.RegistrationDetails.replace(
              ':examSessionId',
              `${examSessionId}`,
            ).replace(':registrationId', '1338'),
            () => HttpResponse.json(registration),
          ),
        );
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
    cy.get('@loadDetails').should('have.been.called');
  });

  it('restores and submits the email form after an authentication return', () => {
    mockDetails({
      is_strongly_identified: false,
      user: { email: 'email-user@example.org' },
    });
    cy.useMswHandlers(
      http.get(APIEndpoints.User, () =>
        HttpResponse.json(WeaklyAuthenticatedSessionResponse),
      ),
    );
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    cy.findByTestId('public-registration__contact-details__email-field').should(
      'contain.text',
      'email-user@example.org',
    );
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
    onExamDetailsPage.acceptTermsOfRegistration(false);
    onExamDetailsPage.acceptPrivacyPolicy();
    onExamDetailsPage.submitForm();
    onExamDetailsPage.isFormSubmitted();
    cy.get('@submit').should('have.been.calledOnce');
    cy.get('@submit')
      .its('firstCall.args.0.body')
      .should('include', { email: 'email-user@example.org' });
    cy.get(`a[href="${paymentPath}"]`).should('be.visible');
  });

  it('completes an eligible free registration and loads details on its success page', () => {
    mockDetails();
    const freeSubmit = cy.spy().as('freeSubmit');
    const saveEducation = cy.spy().as('saveEducation');
    cy.useMswHandlers(
      http.get(APIEndpoints.PublicKoskiEducations, () =>
        HttpResponse.json({
          educations: [{ educationType: 'ylioppilastutkinto', isActive: true }],
          usedFreeRegistrations: 0,
        }),
      ),
      http.post(submitPath, async ({ request }) => {
        freeSubmit(await submitRequestArguments(request));

        return HttpResponse.json({
          code: 'free-code',
          registration_kind: 'ADMISSION',
          state: 'COMPLETED',
        });
      }),
      http.post(
        APIEndpoints.PublicFreeRegistrationEducation.replace(
          ':registrationId',
          '1338',
        ),
        () => {
          saveEducation();

          return HttpResponse.json({ id: 1337 }, { status: 201 });
        },
      ),
    );
    cy.visit(formPath);
    fillStronglyIdentifiedForm(true);
    onExamDetailsPage.submitForm();
    cy.get('@freeSubmit').should('have.been.calledOnce');
    cy.get('@freeSubmit')
      .its('firstCall.args.0')
      .should((request) => {
        expect(request.pathname).to.equal(submitPath);
        expect(request.query).to.deep.equal({ lang: 'fi' });
        expect(request.body).to.include({ free_registration_id: 1337 });
      });
    cy.location('pathname').should(
      'eq',
      `${basePath}/maksuton/999/1338/valmis`,
    );
    cy.findByRole('heading', { level: 1 }).should(
      'contain.text',
      'Ilmoittautuminen onnistui!',
    );
    cy.get('@saveEducation').should('have.been.calledOnce');
  });

  it('shows a recoverable error when the details API returns 401', () => {
    cy.useMswHandlers(
      http.get(detailsPath, () => new HttpResponse(null, { status: 401 })),
    );
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
    const cancel = cy.spy().as('cancel');
    cy.useMswHandlers(
      http.delete('/yki/api/registration/1338', () => {
        cancel();

        return HttpResponse.json({ success: true });
      }),
    );
    cy.visit(formPath);
    onExamDetailsPage.isVisible();
    cy.findByTestId('public-registration__controlButtons__abort').click();
    cy.findByRole('button', {
      name: 'Kyllä, keskeytän ilmoittautumisen',
    }).click();
    cy.get('@cancel').should('have.been.calledOnce');
    cy.location('pathname').should('eq', basePath);
    cy.findByRole('button', { name: 'Hae' }).should('be.visible');
  });

  it('shows an error instead of a form or endless loader for missing details', () => {
    cy.useMswHandlers(
      http.get(detailsPath, () => new HttpResponse(null, { status: 404 })),
    );
    cy.visit(formPath);
    cy.get(`a[href="${basePath}"]`).should('be.visible');
    cy.findByRole('button', { name: 'Lähetä' }).should('not.exist');
  });
});
