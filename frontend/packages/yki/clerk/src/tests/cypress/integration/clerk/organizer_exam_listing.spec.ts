import { APIEndpoints } from 'enums/api';
import { AppRoutes, ExamSessionType } from 'enums/app';
import { examSessions } from 'tests/msw/fixtures/examSession';

const organizerOid = '1.2.246.562.10.28646781493';
const fullExam = examSessions.exam_sessions[0];
const sessions = [
  { ...fullExam, id: 1, session_date: '2024-01-01' },
  {
    ...fullExam,
    id: 2,
    session_date: '2023-01-01',
    type: ExamSessionType.READ_SPEAK,
    participants_read_listen: 2,
    participants_speak_write: 3,
    max_participants_read_listen: 12,
    max_participants_speak_write: 8,
  },
  { ...fullExam, id: 3, session_date: '2022-09-27' },
  { ...fullExam, id: 4, session_date: '2022-06-01' },
  { ...fullExam, id: 5, session_date: '2022-09-26' },
];

for (const view of ['register', 'clerk', 'organizer'] as const) {
  describe(`Exam listing in ${view} view`, () => {
    it('shows sorted exams and subtest counts with compact rows and working links', () => {
      cy.intercept(
        'GET',
        `${APIEndpoints.Organizer}/${organizerOid}/examSession?*`,
        { exam_sessions: sessions },
      );
      if (view === 'organizer') {
        cy.mockAuthUser({
          oid: 'test-organizer',
          isAdmin: false,
          isOrganizer: true,
          isCustomerService: false,
        });
      }
      const route =
        view === 'register'
          ? AppRoutes.ClerkOrganizerRegister
          : view === 'clerk'
            ? AppRoutes.ClerkOrganizerRegisterDetails.replace(
                ':oid',
                organizerOid,
              )
            : AppRoutes.OrganizerHome.replace(':oid', organizerOid);
      cy.viewport(1440, 1000);
      cy.visit(route);
      if (view === 'register') {
        cy.findByRole('button', { name: 'Taitotalo' })
          .should('have.attr', 'aria-expanded', 'false')
          .should('have.css', 'cursor', 'pointer')
          .click();
        cy.findByRole('button', { name: 'Taitotalo' }).should(
          'have.attr',
          'aria-expanded',
          'true',
        );
      }
      cy.contains('Tulevat tutkintotilaisuudet')
        .next()
        .find('table')
        .as('upcoming');
      cy.get('@upcoming').find('tbody tr').should('have.length', 4);
      cy.get('@upcoming')
        .find('tbody tr')
        .first()
        .should('contain.text', '27.9.2022');
      cy.get('@upcoming')
        .find('tbody tr')
        .eq(1)
        .should('contain.text', 'Tekstin ymmärtäminen')
        .and('contain.text', '2 / 12');
      cy.get('@upcoming')
        .find('tbody tr')
        .eq(2)
        .should('contain.text', 'Puhuminen')
        .and('contain.text', '3 / 8');
      cy.get('@upcoming')
        .find('tbody tr')
        .last()
        .should('contain.text', 'Kaikki osakokeet');
      cy.get('@upcoming')
        .find('tbody tr')
        .each(($row) => {
          expect($row.outerHeight()).to.be.at.least(40);
        });
      cy.get('@upcoming')
        .find('tbody a')
        .first()
        .should('have.css', 'text-decoration-line', 'none')
        .and(
          'have.attr',
          'href',
          view === 'organizer'
            ? `/yki/v2/jarjestaja/${organizerOid}/tilaisuus/3`
            : '/yki/v2/virkailija/tilaisuus/3',
        );
      cy.get('@upcoming')
        .findByRole('button', { name: 'Tutkintopäivä' })
        .click();
      cy.get('@upcoming')
        .find('tbody tr')
        .first()
        .should('contain.text', '1.1.2024');
      if (view === 'register') {
        cy.findByTestId('clerk-register__past-exam-sessions-accordion').click();
        cy.findByTestId('clerk-register__past-exam-sessions').as('past');
      } else {
        cy.contains('Menneet tutkintotilaisuudet')
          .parent()
          .next()
          .find('table')
          .as('past');
      }
      cy.get('@past')
        .find('tbody tr')
        .first()
        .should('contain.text', '26.9.2022');
      cy.get('@past').findByRole('button', { name: 'Tutkintopäivä' }).click();
      cy.get('@past')
        .find('tbody tr')
        .last()
        .should('contain.text', '26.9.2022');
      cy.get('@upcoming')
        .find('tbody tr')
        .first()
        .should('contain.text', '1.1.2024');
      cy.screenshot(`exam-listing-${view}`, { capture: 'viewport' });
    });
  });
}
