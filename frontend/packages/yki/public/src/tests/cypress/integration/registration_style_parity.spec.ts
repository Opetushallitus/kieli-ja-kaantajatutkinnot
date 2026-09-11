import { http, HttpResponse } from 'msw';
import { generatePath } from 'react-router';

import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { RegistrationStep } from 'features/registration/modelv2';
import { stepPath } from 'features/registration/routesv2';
import {
  registrationFixture,
  saveRegistration,
} from 'features/registration/tests/handlersv2';
import { getTestWorker } from 'tests/cypress/support/mswv2';

const form = '.public-registration__grid__form-container';
const timer = '.public-registration__grid__progress-container';
const primary = '.MuiButton-containedSecondary';
const abort = '.MuiButton-textSecondary';
const properties = [
  'background-color',
  'color',
  'font-size',
  'font-weight',
  'font-family',
  'letter-spacing',
  'text-transform',
  'padding',
  'margin',
  'border-top-width',
  'border-top-color',
  'box-shadow',
  'max-width',
  'display',
  'width',
  'height',
];

// Compare computed browser styles against the original, so losing a scoped SCSS
// ancestor, shared button, or responsive layout fails without updating snapshots.
const appearance = (selector: string) =>
  cy
    .get(selector)
    .first()
    .should('be.visible')
    .then(($element) => {
      const element = $element[0];
      const style =
        element.ownerDocument.defaultView!.getComputedStyle(element);

      return Object.fromEntries(
        properties.map((property) => [
          property,
          style.getPropertyValue(property),
        ]),
      );
    });

afterEach(() => sessionStorage.removeItem('msw:yki-v2-now'));

for (const mobile of [false, true]) {
  describe(`Registration visual parity (${mobile ? 'phone' : 'desktop'})`, () => {
    for (const step of ['Identify', 'Register', 'Payment', 'Done'] as const) {
      for (const authenticated of step === 'Identify'
        ? [true, false]
        : [true]) {
        it(`uses the original ${step}${authenticated ? '' : ' without a session'} layout, typography and controls`, () => {
          cy.viewport(mobile ? 375 : 1440, mobile ? 812 : 1000);
          sessionStorage.setItem(
            'msw:yki-v2-now',
            String(new Date('2022-09-27T14:00:00Z').getTime()),
          );
          const base = registrationFixture();
          const data = registrationFixture({
            ...(authenticated
              ? {}
              : {
                  session: { identity: null },
                  user: {},
                  is_strongly_identified: false,
                }),
            exam_session: {
              ...base.exam_session,
              type: 'FULL',
              registration_start_date: '2020-01-01',
              registration_end_date: '2030-12-31',
              available_registration_kind: RegistrationKind.Admission,
              partial_registration_kind: {
                ALL_PARTS: RegistrationKind.Admission,
              },
            },
            partial_exam_type: 'ALL_PARTS',
            state:
              step === 'Done'
                ? RegistrationStates.Completed
                : step === 'Payment'
                  ? RegistrationStates.Submitted
                  : RegistrationStates.Started,
            payment: {
              url: '/mock-payment',
              due_date: '2022-09-28T14:00:00Z',
              status: step === 'Done' ? 'PAID' : 'PENDING',
            },
          });
          getTestWorker().use(
            http.get(APIEndpoints.ExamSession, () =>
              HttpResponse.json(data.exam_session),
            ),
            http.get(APIEndpoints.User, () => HttpResponse.json(data.session)),
            http.get(APIEndpoints.Registration, () =>
              HttpResponse.json({
                id: data.registration_id,
                exam_session_id: data.exam_session.id,
                kind: data.registration_kind,
                partial_exam_type: data.partial_exam_type,
              }),
            ),
            http.post(APIEndpoints.IdentifyRegistration, () =>
              HttpResponse.json(data),
            ),
            http.get(APIEndpoints.LoginLinkInfo, () =>
              HttpResponse.json({
                // The legacy API returns link expiry; its serializer subtracts a day.
                expires_at: '2022-09-29T14:00:00Z',
              }),
            ),
            http.get(APIEndpoints.PublicKoskiEducations, () =>
              HttpResponse.json({ educations: [], usedFreeRegistrations: 3 }),
            ),
          );
          const ids = { examSessionId: '100', registrationId: '501' };
          const legacyPaths: Record<RegistrationStep, string> = {
            Identify: `${generatePath(AppRoutes.ExamSession, ids)}?registrationId=501`,
            Register: generatePath(AppRoutes.ExamSessionRegistration, ids),
            Payment: `${generatePath(AppRoutes.ExamSessionRegistration, ids)}?submitted=true&code=style-test`,
            Done: `${AppRoutes.RegistrationPaymentStatus}?id=100&status=payment-success`,
          };
          const selectors = [
            '.public-registration__grid__heading h1',
            '.public-registration__grid .MuiPaper-root',
            form,
            `${form} h2`,
            `${form} p`,
            `${form} ${primary}`,
            mobile
              ? '.public-registration__grid__circular-stepper-container'
              : '.public-registration__grid__stepper',
          ];
          if (step === 'Identify' || step === 'Register')
            selectors.push(`${form} ${abort}`);
          if (step === 'Register')
            selectors.push(
              timer,
              `${timer} .public-registration__grid__progress-text`,
              `${timer} .MuiLinearProgress-bar`,
            );
          cy.setCookie('cookie-consent-yki', 'true');
          cy.visit(legacyPaths[step]);
          cy.get(form).should('be.visible');
          if (!authenticated)
            cy.findByRole('button', {
              name: 'Tunnistaudu sähköpostillasi',
            }).click();
          if (step === 'Payment')
            cy.get(form).should('contain.text', '28.9.2022');
          if (step === 'Register')
            cy.get(form).should(
              'contain.text',
              'Sinulla on maksuttomia ilmoittautumisia jäljellä: 0',
            );
          if (mobile && step === 'Register')
            cy.get(form)
              .find('select')
              .first()
              .find('option')
              .should('contain.text', 'Suomi');
          cy.document().then((document) => document.fonts.ready);
          const reference: Record<string, Record<string, string>> = {};
          let originalText = '';
          let originalStepperText = '';
          const stepper = mobile
            ? '.public-registration__grid__circular-stepper-container'
            : '.public-registration__grid__stepper';
          cy.get(stepper)
            .invoke('text')
            .then((text) => {
              originalStepperText = text;
            });
          cy.get(form)
            .invoke('text')
            .then((text) => {
              originalText = text.replace(/\s+/g, '');
            });
          selectors.forEach((selector) =>
            appearance(selector).then((style) => {
              reference[selector] = style;
            }),
          );
          cy.then(() => saveRegistration(data));
          cy.visit(stepPath(step, { examSessionId: 100, registrationId: 501 }));
          cy.findByTestId(`registration-v2-${step}`).should('be.visible');
          if (!authenticated)
            cy.findByRole('button', {
              name: 'Tunnistaudu sähköpostillasi',
            }).click();
          if (step === 'Register')
            cy.get(form).should(
              'contain.text',
              'Sinulla on maksuttomia ilmoittautumisia jäljellä: 0',
            );
          if (mobile && step === 'Register')
            cy.get(form)
              .find('select')
              .first()
              .find('option')
              .should('contain.text', 'Suomi');
          cy.document().then((document) => document.fonts.ready);
          selectors.forEach((selector) =>
            appearance(selector).then((style) =>
              expect(style, selector).to.deep.equal(reference[selector]),
            ),
          );
          cy.get(stepper).should(($stepper) =>
            expect($stepper.text()).to.equal(originalStepperText),
          );
          cy.get(form)
            .invoke('text')
            .then((text) =>
              expect(
                text.replace(/\s+/g, ''),
                'original step content',
              ).to.equal(originalText),
            );
          cy.get(`${form} ${primary}`)
            .first()
            .should('have.css', 'color', 'rgb(255, 255, 255)')
            .and('have.css', 'background-color', 'rgb(55, 135, 3)');
          if (step === 'Register') {
            cy.get(timer).should('have.length', 1);
            if (!mobile)
              cy.get('.public-registration__grid__heading')
                .find(timer)
                .should('be.visible');
            cy.findByTestId(
              'public-registration__controlButtons__abort',
            ).should('be.visible');
          } else cy.get(timer).should('not.exist');
          cy.screenshot(
            `registration-parity-${step}-${authenticated ? 'authenticated' : 'anonymous'}-${mobile ? 'phone' : 'desktop'}`,
            { capture: 'fullPage' },
          );
        });
      }
    }
  });
}
