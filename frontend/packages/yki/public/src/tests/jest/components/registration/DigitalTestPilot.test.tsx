import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { APIResponseStatus, AppLanguage } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

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
import { ExamSessionUtils } from 'utils/examSession';
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
): ExamSession => ({
  ...baseSession,
  id,
  type: 'FULL',
  language_code: ExamLanguage.FIN,
  level_code: ExamLevel.KESKI,
  session_date: dayjs('2026-11-07'),
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

describe('digital test pilot selection', () => {
  it.each(pilotIds)('includes pilot exam session %i', (id) => {
    expect(ExamSessionUtils.isDigitalTest(id)).toBe(true);
  });

  it.each([
    0, 1, 4262, 4264, 4278, 4280, 4389, 4391, 4414, 4416, 4567, 4569, 4579,
    4582, 99999,
  ])('defaults unlisted exam session %i to paper', (id) => {
    expect(ExamSessionUtils.isDigitalTest(id)).toBe(false);
  });
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
      it.each([4390, 4581, 4391])('shows the format of session %i', (id) => {
        const session = createSession(id, kind);
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
        expectFormat(id !== 4391);
        const formatLabel = screen.getByText('Testityyppi');
        expect(formatLabel.tagName).toBe('DT');
        expect(formatLabel.nextElementSibling).toContainElement(
          screen.getByText(id === 4391 ? 'Paperitesti' : 'Digitesti'),
        );
        expect(
          formatLabel.previousElementSibling?.previousElementSibling,
        ).toHaveTextContent('Osakokeet');
        expect(
          formatLabel.nextElementSibling?.nextElementSibling,
        ).toHaveTextContent('Testipäivä');
      });
    });
  },
);

describe('payment confirmation from the user portal', () => {
  it.each([
    [4390, 99999, true],
    [4391, 4390, false],
  ] as const)(
    'uses session %i rather than registration %i for the test format',
    (examSessionId, registrationId, digital) => {
      const session = createSession(examSessionId, RegistrationKind.Admission);
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
