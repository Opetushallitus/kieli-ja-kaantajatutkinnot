import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router';

import { OrganizerExamSessionListing } from 'components/clerkRegister/listing/OrganizerExamSessionListing';
import { initI18n } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

const organizerOid = examSessions.exam_sessions[0].organizer_oid!;
const session = (
  id: number,
  date: string,
  overrides: Partial<ExamSession> = {},
): ExamSession => ({
  ...SerializationUtils.deserializeExamSessionResponse(
    examSessions.exam_sessions[0],
  ),
  id,
  session_date: dayjs(date),
  ...overrides,
});

const renderListing = (
  sessions: ExamSession[],
  period: 'upcoming' | 'past' = 'upcoming',
  route: 'clerk' | 'organizer' = 'clerk',
) =>
  render(
    <MemoryRouter>
      <OrganizerExamSessionListing
        examSessions={sessions}
        organizerOid={organizerOid}
        route={route}
        period={period}
      />
    </MemoryRouter>,
  );

const links = () =>
  screen.getAllByRole('link').map((link) => link.getAttribute('href'));
const ids = () => links().map((link) => Number(link!.split('/').pop()));

beforeAll(async () => {
  global.REACT_ENV_PRODUCTION = true;
  await initI18n();
});

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout'] });
  jest.setSystemTime(new Date('2026-10-26T12:00:00'));
});
afterEach(() => jest.useRealTimers());

it('orders upcoming exams by date, language and level, including today and only this organizer', () => {
  renderListing([
    session(4, '2026-11-01'),
    session(3, '2026-10-26', { level_code: ExamLevel.YLIN }),
    session(2, '2026-10-26', { level_code: ExamLevel.PERUS }),
    session(1, '2026-10-26', { language_code: ExamLanguage.ENG }),
    session(5, '2026-10-25'),
    session(6, '2026-10-26', { organizer_oid: 'other' }),
  ]);
  expect(ids()).toEqual([1, 2, 3, 4]);
  expect(
    screen.getByRole('columnheader', { name: /Tutkintopäivä/ }),
  ).toHaveAttribute('aria-sort', 'ascending');
});

it('orders past exams newest first and uses organizer links', () => {
  renderListing(
    [
      session(1, '2026-09-01'),
      session(3, '2026-10-26'),
      session(2, '2026-10-25'),
    ],
    'past',
    'organizer',
  );
  expect(ids()).toEqual([2, 1]);
  expect(links()[0]).toBe(`/yki/v2/jarjestaja/${organizerOid}/tilaisuus/2`);
  expect(
    screen.getByRole('columnheader', { name: /Tutkintopäivä/ }),
  ).toHaveAttribute('aria-sort', 'descending');
});

it('sorts each requested column in both directions and restores the default order', async () => {
  const user = userEvent.setup();
  renderListing([
    session(1, '2026-11-01', {
      language_code: ExamLanguage.FIN,
      level_code: ExamLevel.PERUS,
      registration_start_date: dayjs('2026-09-01'),
    }),
    session(2, '2026-12-01', {
      language_code: ExamLanguage.ENG,
      level_code: ExamLevel.YLIN,
      registration_start_date: dayjs('2026-08-01'),
    }),
  ]);
  await user.click(screen.getByRole('button', { name: 'Tutkintopäivä' }));
  expect(ids()).toEqual([2, 1]);
  await user.click(screen.getByRole('button', { name: 'Tutkintopäivä' }));
  expect(ids()).toEqual([1, 2]);
  for (const [name, ascending] of [
    ['Kieli', [2, 1]],
    ['Taso', [1, 2]],
    ['Ilmoittautumisaika', [2, 1]],
  ] as const) {
    await user.click(screen.getByRole('button', { name }));
    expect(ids()).toEqual(ascending);
    await user.click(screen.getByRole('button', { name }));
    expect(ids()).toEqual([...ascending].reverse());
    await user.click(screen.getByRole('button', { name }));
    expect(ids()).toEqual([1, 2]);
  }
  expect(
    within(screen.getAllByRole('row')[1]).getByText('1.9.2026 – 31.12.2030'),
  ).toBeInTheDocument();
});
