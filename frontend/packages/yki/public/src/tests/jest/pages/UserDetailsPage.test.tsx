import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { APIResponseStatus, AppLanguage } from 'shared/enums';

import { changeLang } from 'configs/i18n';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
import { UserDetailsPage } from 'pages/UserDetailsPage';
import {
  storePersonDetails,
  userDetailsReducer,
} from 'redux/reducers/userDetails';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { personDetails } from 'tests/msw/fixtures/personDetails';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

beforeEach(async () => {
  await changeLang(AppLanguage.Finnish);
});

const renderRegistration = (overrides: Partial<PersonRegistrations> = {}) => {
  const person = SerializationUtils.deserializePersonDetails(personDetails);
  const registration: PersonRegistrations = {
    ...person.registrations[0],
    state: RegistrationStates.Submitted,
    kind: RegistrationKind.Queue,
    type: 'FULL',
    partialExamType: 'ALL_PARTS',
    registrationStartDate: dayjs('2026-10-01'),
    registrationEndDate: dayjs('2026-11-01'),
    examDate: dayjs('2026-11-17'),
    evaluationState: undefined,
    isCancellable: true,
    positionInQueue: 3,
    queueEnded: false,
    ...overrides,
  };

  render(
    <DefaultProviders
      preloadedState={{
        nationalities: {
          status: APIResponseStatus.Success,
          nationalities: [],
        },
        userDetails: userDetailsReducer(
          undefined,
          storePersonDetails({ ...person, registrations: [registration] }),
        ),
      }}
    >
      <UserDetailsPage />
    </DefaultProviders>,
  );
};

it.each([true, false, undefined])(
  'deserializes queue_ended=%s',
  (queueEnded) => {
    const person = SerializationUtils.deserializePersonDetails({
      ...personDetails,
      registrations: [
        { ...personDetails.registrations[0], queue_ended: queueEnded },
      ],
    });

    expect(person.registrations[0].queueEnded).toBe(queueEnded ?? false);
  },
);

describe('UserDetailsPage registration queue closure', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-10T22:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<Partial<PersonRegistrations>>([
    {},
    { type: 'READ_SPEAK', partialExamType: 'READ' },
    { type: 'READ_SPEAK', partialExamType: 'SPEAK' },
    { type: 'LISTEN_WRITE', partialExamType: 'LISTEN' },
    { type: 'LISTEN_WRITE', partialExamType: 'WRITE' },
    { examDate: dayjs('2026-11-01') },
  ])('shows an ended queue as cancelled: %j', (overrides) => {
    renderRegistration({
      ...overrides,
      state: RegistrationStates.Expired,
      queueEnded: true,
    });

    const cancelledSection = screen.getByRole('heading', {
      name: 'Perutut ilmoittautumiset',
    }).parentElement!;
    expect(
      within(cancelledSection).getByText('Peruttu, jonotus loppunut'),
    ).toBeVisible();
    expect(screen.queryByText(/Jonossa \(sija/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /^(Peru ilmoittautuminen|perua ilmoittautumisen)$/,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Sinulla ei ole tulevia ilmoittautumisia.'),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Sinulla ei ole suorituksia tai menneitä ilmoittautumisia.',
      ),
    ).toBeVisible();
  });

  it('keeps a queue open when the server flag is false', () => {
    renderRegistration();

    expect(screen.getByText('Jonossa (sija 3)')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: /^(Peru ilmoittautuminen|perua ilmoittautumisen)$/,
      }),
    ).toBeEnabled();
    expect(
      screen.queryByText('Perutut ilmoittautumiset'),
    ).not.toBeInTheDocument();
  });

  it('shows the server closure even when the browser clock is before the cutoff', () => {
    jest.setSystemTime(new Date('2026-11-01T10:00:00Z'));
    renderRegistration({ state: RegistrationStates.Expired, queueEnded: true });

    expect(screen.getByText('Peruttu, jonotus loppunut')).toBeVisible();
    expect(screen.queryByText(/Jonossa \(sija/)).not.toBeInTheDocument();
  });

  it('shows an ended queue before the scheduler expires the registration', () => {
    renderRegistration({ queueEnded: true });

    expect(screen.getByText('Peruttu, jonotus loppunut')).toBeVisible();
    expect(screen.queryByText(/Jonossa \(sija/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'perua ilmoittautumisen' }),
    ).not.toBeInTheDocument();
  });

  it.each([false, undefined])(
    'keeps the generic reason for an expired attempt with queueEnded=%s',
    (queueEnded) => {
      renderRegistration({ state: RegistrationStates.Expired, queueEnded });

      expect(screen.getByText('Peruttu')).toBeVisible();
      expect(
        screen.queryByText('Peruttu, jonotus loppunut'),
      ).not.toBeInTheDocument();
    },
  );

  it('includes a started registration without labeling it as an ended queue', () => {
    renderRegistration({ state: RegistrationStates.Started });

    expect(
      screen.getByRole('heading', { name: 'suomi, keskitaso, 17.11.2026' }),
    ).toBeVisible();
    expect(
      screen.queryByText('Peruttu, jonotus loppunut'),
    ).not.toBeInTheDocument();
  });

  it.each([RegistrationStates.Cancelled, RegistrationStates.PaidAndCancelled])(
    'preserves the existing cancellation reason for %s',
    (state) => {
      renderRegistration({ state });

      expect(screen.getByText('Peruttu')).toBeVisible();
      expect(
        screen.queryByText('Peruttu, jonotus loppunut'),
      ).not.toBeInTheDocument();
    },
  );

  it('shows an expired admission as a generic cancellation', () => {
    renderRegistration({
      kind: RegistrationKind.Admission,
      state: RegistrationStates.Expired,
    });

    expect(screen.getByText('Peruttu')).toBeVisible();
    expect(
      screen.queryByText('Peruttu, jonotus loppunut'),
    ).not.toBeInTheDocument();
  });

  it.each([RegistrationStates.Submitted, RegistrationStates.Completed])(
    'keeps an admission %s after the queue closes',
    (state) => {
      renderRegistration({
        state,
        kind: RegistrationKind.Admission,
        liftedFromQueueAt: dayjs('2026-11-10'),
      });

      expect(screen.getByText('Ilmoittautunut')).toBeVisible();
      expect(
        screen.queryByText('Peruttu, jonotus loppunut'),
      ).not.toBeInTheDocument();
    },
  );
});

describe('UserDetailsPage registration card actions', () => {
  it.each<Partial<PersonRegistrations>>([
    { state: RegistrationStates.Completed, kind: RegistrationKind.Admission },
    { state: RegistrationStates.Completed, examDate: dayjs('2025-11-17') },
    { state: RegistrationStates.Cancelled },
  ])('includes the exam date in the card heading: %j', (overrides) => {
    renderRegistration(overrides);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: `suomi, keskitaso, ${overrides.examDate ? '17.11.2025' : '17.11.2026'}`,
      }),
    ).toBeVisible();
  });

  it('opens the cancellation modal from the inline link on a completed registration', async () => {
    const user = userEvent.setup();
    renderRegistration({
      state: RegistrationStates.Completed,
      kind: RegistrationKind.Admission,
    });

    const cancelLink = screen.getByRole('button', {
      name: 'perua ilmoittautumisen',
    });
    expect(cancelLink.parentElement).toHaveTextContent(
      'En voi osallistua YKI-testiin. Haluan perua ilmoittautumisen.',
    );
    expect(
      screen.queryByRole('button', { name: 'Peru ilmoittautuminen' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Vahvista ilmoittautuminen' }),
    ).not.toBeInTheDocument();

    await user.click(cancelLink);

    expect(
      screen.getByRole('alertdialog', {
        name: 'Haluatko perua ilmoittautumisen suomi, keskitaso, 17.11.2026?',
      }),
    ).toBeVisible();
  });

  it('retains the cancellation button beside the confirmation button', async () => {
    const user = userEvent.setup();
    renderRegistration({ kind: RegistrationKind.Admission });

    expect(
      screen.getByRole('link', { name: 'Vahvista ilmoittautuminen' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'perua ilmoittautumisen' }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Peru ilmoittautuminen' }),
    );

    expect(screen.getByRole('alertdialog')).toBeVisible();
  });

  it('disables the inline link when cancellation is no longer allowed', async () => {
    const user = userEvent.setup();
    renderRegistration({
      state: RegistrationStates.Completed,
      kind: RegistrationKind.Admission,
      isCancellable: false,
    });

    const cancelLink = screen.getByRole('button', {
      name: 'perua ilmoittautumisen',
    });
    expect(cancelLink).toBeDisabled();
    await user.click(cancelLink);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
