import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { APIResponseStatus, AppLanguage } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { ExamSessionFormat } from 'components/registration/examSession/ExamSessionFormat';
import { PublicExamSessionCard } from 'components/registration/examSession/PublicExamSessionCard';
import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { changeLang, initI18nForTests } from 'configs/i18n';
import { RootState } from 'configs/redux';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { ConfirmRegistrationPage } from 'pages/ConfirmRegistrationPage';
import { ContentSelector } from 'pages/InitRegistrationPage';
import { initialState as initialRegistrationState } from 'redux/reducers/registration';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');
jest.mock('shared/hooks', () => ({
  ...jest.requireActual('shared/hooks'),
  useWindowProperties: jest.fn(),
}));

const pilotIds = [4390, 4415, 4279, 4580, 4568, 4263, 4581];
const digitalDescription =
  'Testi tehdään testipaikalla järjestäjän tarjoamalla tietokoneella.';
const paperDescription = 'Testi tehdään testipaikalla kynällä paperille.';

const baseSession = SerializationUtils.deserializeExamSessionResponse(
  examSessions.exam_sessions.find((session) => session.type === 'FULL')!,
);

const createSession = (
  id: number,
  registrationKind: RegistrationKind,
  language = ExamLanguage.FIN,
  date = '2026-11-07',
): ExamSession => ({
  ...baseSession,
  id,
  type: 'FULL',
  language_code: language,
  level_code: ExamLevel.KESKI,
  session_date: dayjs(date),
  open: true,
  upcoming_admission: true,
  available_registration_kind: registrationKind,
  partial_registration_kind: { ALL_PARTS: registrationKind },
});

const createState = (
  examSession: ExamSession,
  activeStep = PublicRegistrationFormStep.Identify,
  submitted = false,
): Partial<RootState> => ({
  examSession: { status: APIResponseStatus.Success, examSession },
  registration: {
    ...initialRegistrationState,
    activeStep,
    isEmailRegistration: true,
    fetchRegistrationStatus: APIResponseStatus.Success,
    initRegistration: {
      status: APIResponseStatus.Success,
      examSessionId: examSession.id,
      registrationId: 99999,
      registrationKind: examSession.available_registration_kind,
      partialExamType: 'ALL_PARTS',
    },
    submitRegistration: {
      status: submitted
        ? APIResponseStatus.Success
        : APIResponseStatus.NotStarted,
      registrationKind: examSession.available_registration_kind,
      code: submitted ? 'test-code' : undefined,
    },
  },
});

const expectFormat = (digital: boolean, showDescription = true) => {
  const label = digital ? 'Digitesti' : 'Paperitesti';
  expect(screen.getByText(label).parentElement).toHaveTextContent(
    showDescription
      ? `${label} - ${digital ? digitalDescription : paperDescription}`
      : label,
  );
  if (!showDescription) {
    expect(screen.queryByText(digitalDescription)).not.toBeInTheDocument();
    expect(screen.queryByText(paperDescription)).not.toBeInTheDocument();
    expect(
      screen
        .getByText(label)
        .closest('.exam-session-card__partial-exam-indicator'),
    ).not.toBeNull();
  }
  expect(
    screen.queryByText(digital ? 'Paperitesti' : 'Digitesti'),
  ).not.toBeInTheDocument();
  expect(
    screen.getByTestId(digital ? 'LaptopIcon' : 'NoteAltOutlinedIcon'),
  ).toHaveAttribute('aria-hidden', 'true');
};

beforeAll(async () => {
  await initI18nForTests();
});

beforeEach(async () => {
  await changeLang(AppLanguage.Finnish);
  jest.mocked(useWindowProperties).mockReturnValue({
    isPhone: false,
    isTablet: false,
    isDesktopXS: true,
    isDesktop: true,
    width: 1280,
    height: 800,
  });
  window.history.replaceState({}, '', '/?submitted=true&status=success');
});

describe('existing digital test pilot sessions', () => {
  it.each(pilotIds)(
    'keeps the digital badge and description for pilot session %i before 2027',
    (examSessionId) => {
      render(
        <DefaultProviders>
          <ExamSessionFormat
            examSession={createSession(
              examSessionId,
              RegistrationKind.Admission,
              ExamLanguage.FIN,
              '2026-11-07',
            )}
            showDescription
          />
        </DefaultProviders>,
      );
      expectFormat(true);
    },
  );
});

describe.each([
  ['digital', 4390],
  ['paper', 4391],
] as const)('%s exam session format snapshots', (_format, examSessionId) => {
  it.each([false, true])('renders with description=%s', (showDescription) => {
    const { asFragment } = render(
      <DefaultProviders>
        <ExamSessionFormat
          examSession={createSession(examSessionId, RegistrationKind.Admission)}
          showDescription={showDescription}
        />
      </DefaultProviders>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe.each([false, true])('exam cards with isPhone=%s', (isPhone) => {
  it.each([
    [ExamLanguage.FIN, '2026-12-31', false],
    [ExamLanguage.SWE, '2026-12-31', false],
    [ExamLanguage.FIN, '2027-01-01', true],
    [ExamLanguage.SWE, '2027-01-01', true],
    [ExamLanguage.ENG, '2027-01-01', false],
  ] as const)(
    'shows the badge without a description for %s exams on %s',
    (language, date, digital) => {
      jest.mocked(useWindowProperties).mockReturnValue({
        isPhone,
        isTablet: false,
        isDesktopXS: !isPhone,
        isDesktop: !isPhone,
        width: isPhone ? 375 : 1280,
        height: 800,
      });
      const session = createSession(
        4391,
        RegistrationKind.Admission,
        language,
        date,
      );
      render(
        <DefaultProviders>
          <PublicExamSessionCard examSession={session} />
        </DefaultProviders>,
      );
      expectFormat(digital, false);
    },
  );
});

describe.each([RegistrationKind.Admission, RegistrationKind.Queue])(
  '%s registration flow',
  (kind) => {
    describe.each([
      ['identification', PublicRegistrationFormStep.Identify, false],
      ['registration form', PublicRegistrationFormStep.Register, false],
      ['submission confirmation', PublicRegistrationFormStep.Register, true],
      ['completion', PublicRegistrationFormStep.Done, true],
    ] as const)('%s', (_label, step, submitted) => {
      it.each([
        [4390, ExamLanguage.FIN, '2026-11-07', true],
        [4581, ExamLanguage.FIN, '2026-11-07', true],
        [4391, ExamLanguage.FIN, '2026-11-07', false],
        [4391, ExamLanguage.FIN, '2027-01-01', true],
        [4391, ExamLanguage.SWE, '2027-01-01', true],
        [4391, ExamLanguage.ENG, '2027-01-01', false],
      ] as const)(
        'shows the format of session %i (%s, %s)',
        (id, language, date, digital) => {
          const session = createSession(id, kind, language, date);
          render(
            <DefaultProviders
              preloadedState={createState(session, step, submitted)}
            >
              {step === PublicRegistrationFormStep.Identify ? (
                <ContentSelector />
              ) : (
                <PublicRegistrationGrid />
              )}
            </DefaultProviders>,
          );
          expectFormat(digital);
          const formatLabel = screen.getByText('Testityyppi');
          expect(formatLabel.tagName).toBe('DT');
          expect(formatLabel.nextElementSibling).toContainElement(
            screen.getByText(digital ? 'Digitesti' : 'Paperitesti'),
          );
          expect(
            formatLabel.previousElementSibling?.previousElementSibling,
          ).toHaveTextContent('Osakokeet');
          expect(
            formatLabel.nextElementSibling?.nextElementSibling,
          ).toHaveTextContent('Testipäivä');
        },
      );
    });
  },
);

describe('payment confirmation from the user portal', () => {
  it.each([
    [4390, 99999, ExamLanguage.FIN, '2026-11-07', true],
    [4391, 4390, ExamLanguage.FIN, '2026-11-07', false],
    [4391, 99999, ExamLanguage.FIN, '2027-01-01', true],
    [4391, 99999, ExamLanguage.SWE, '2027-01-01', true],
    [4391, 4390, ExamLanguage.ENG, '2027-01-01', false],
  ] as const)(
    'uses session %i rather than registration %i for the test format (%s, %s)',
    (examSessionId, registrationId, language, date, digital) => {
      const session = createSession(
        examSessionId,
        RegistrationKind.Admission,
        language,
        date,
      );
      const state = createState(session);
      state.registration!.initRegistration.registrationId = registrationId;
      state.confirmRegistration = {
        loadDetailsStatus: APIResponseStatus.Success,
        confirmRegistrationStatus: APIResponseStatus.NotStarted,
        registrationDetails: {
          id: registrationId,
          session_date: session.session_date,
          language_code: session.language_code,
          level_code: session.level_code,
          location: session.location,
          registration_start_date: session.registration_start_date,
          registration_end_date: session.registration_end_date,
          exam_fee: session.exam_fee,
          due_date: dayjs('2026-10-01'),
          payment_url: '/payment',
        },
      };
      render(
        <DefaultProviders preloadedState={state}>
          <ConfirmRegistrationPage />
        </DefaultProviders>,
      );
      expectFormat(digital);
    },
  );
});
