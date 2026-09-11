import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';
import { onPublicRegistrationPage } from 'tests/cypress/support/page-objects/publicRegistrationPage';
import { examSessions } from 'tests/msw/fixtures/examSession';

describe('Digital test pilot', () => {
  [false, true].forEach((isPhone) => {
    [RegistrationKind.Admission, RegistrationKind.Queue].forEach((kind) => {
      [4390, 4391].forEach((id) => {
        it(`shows session ${id} format on ${isPhone ? 'mobile' : 'desktop'} cards and ${kind} identification`, () => {
          const digital = id === 4390;
          const label = digital ? 'Digitesti' : 'Paperitesti';
          const description = digital
            ? 'Testi tehdään testipaikalla järjestäjän tarjoamalla tietokoneella.'
            : 'Testi tehdään testipaikalla kynällä paperille.';
          const session: ExamSessionResponse = {
            ...examSessions.exam_sessions[0],
            id,
            type: 'FULL',
            language_code: ExamLanguage.FIN,
            level_code: ExamLevel.KESKI,
            session_date: '2026-11-07',
            open: true,
            available_registration_kind: kind,
            partial_registration_kind: { ALL_PARTS: kind },
          };
          cy.useMswHandlers(
            http.get(APIEndpoints.ExamSessions, () =>
              HttpResponse.json({ exam_sessions: [session] }),
            ),
            http.get(APIEndpoints.ExamSession, () =>
              HttpResponse.json(session),
            ),
          );
          cy.viewport(isPhone ? 375 : 1280, 900);
          cy.openPublicRegistrationPage();
          onPublicRegistrationPage.selectExamLanguage('suomi', isPhone);
          onPublicRegistrationPage.selectExamLevel('keskitaso', isPhone);
          onPublicRegistrationPage.search();

          cy.get('.exam-session-format')
            .should('be.visible')
            .and('have.text', label)
            .and('have.css', 'color', 'rgb(29, 29, 29)');
          cy.get('.exam-session-format__label')
            .should('have.css', 'font-size', '14px')
            .and('have.css', 'font-weight', '600');
          cy.get('.exam-session-format__icon')
            .should('have.css', 'width', '24px')
            .and('have.css', 'height', '24px')
            .and('have.attr', 'viewBox', '0 0 24 24')
            .and('have.attr', 'aria-hidden', 'true');
          cy.get('.exam-session-format').should(($format) => {
            expect($format[0].scrollWidth).to.be.at.most(
              $format[0].clientWidth,
            );
          });
          onPublicRegistrationPage
            .getResultCards()
            .findByRole('button', {
              name:
                kind === RegistrationKind.Admission ? 'Ilmoittaudu' : /jonoon/i,
            })
            .click();
          cy.findByRole('heading', {
            name:
              kind === RegistrationKind.Queue
                ? 'Tunnistaudu jonoon ilmoittautumista varten'
                : 'Tunnistaudu ilmoittautumista varten',
          }).should('be.visible');
          cy.get('.exam-session-format')
            .should('be.visible')
            .and('have.text', `${label} - ${description}`);
          cy.contains('dt', 'Testityyppi')
            .should('be.visible')
            .and('have.css', 'color', 'rgb(29, 29, 29)')
            .next('dd')
            .should('have.text', `${label} - ${description}`);
        });
      });
    });
  });
});
