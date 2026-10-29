import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionDetails } from 'components/clerkExamSession/ClerkExamSessionDetails';
import { ExamSessionType } from 'enums/app';
import { RouteType } from 'interfaces/user';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

beforeAll(async () => {
  await use(initReactI18next).init({
    lng: 'fi-FI',
    defaultNS: 'common',
    fallbackLng: 'fi-FI',
    resources: { 'fi-FI': { public: publicFI, common: commonFI } },
  });
  DateUtils.setDayjsLocale(AppLanguage.Finnish);
});

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe.each<RouteType>(['clerk', 'organizer'])(
  '%s session details',
  (route) => {
    it.each([
      { today: '2026-12-28T12:00:00', ended: false },
      { today: '2026-12-29T23:59:59', ended: false },
      { today: '2026-12-30T00:00:00', ended: true },
    ])(
      'shows the queue deadline and closed badge appropriately on $today',
      ({ today, ended }) => {
        jest.setSystemTime(new Date(today));
        render(
          <DefaultProviders>
            <ClerkExamSessionDetails
              examSessionDetails={{
                ...SerializationUtils.deserializeClerkExamSessionResponse(
                  clerkExamSession,
                ),
                date: dayjs('2027-01-05'),
              }}
              examDates={[]}
              route={route}
            />
          </DefaultProviders>,
        );
        expect(screen.getByText('Jonotus päättyy')).toBeInTheDocument();
        expect(screen.getByText('29.12.2026')).toBeInTheDocument();
        if (ended) {
          expect(screen.getByText('Jonotus päättynyt')).toBeInTheDocument();
        } else {
          expect(
            screen.queryByText('Jonotus päättynyt'),
          ).not.toBeInTheDocument();
        }
      },
    );

    it.each([
      {
        type: ExamSessionType.READ_SPEAK,
        first: 'Tekstin ymmärtäminen',
        second: 'Puhuminen',
      },
      {
        type: ExamSessionType.LISTEN_WRITE,
        first: 'Puheen ymmärtäminen',
        second: 'Kirjoittaminen',
      },
    ])(
      'renders partial exam capacities and start times for $type',
      ({ type, first, second }) => {
        render(
          <DefaultProviders>
            <ClerkExamSessionDetails
              examSessionDetails={{
                ...SerializationUtils.deserializeClerkExamSessionResponse(
                  clerkExamSession,
                ),
                type,
                maxParticipantsReadListen: 12,
                maxParticipantsSpeakWrite: 8,
              }}
              examDates={[]}
              route={route}
            />
          </DefaultProviders>,
        );
        expect(screen.getByText(`${first}: 12`)).toBeInTheDocument();
        expect(screen.getByText(`${second}: 8`)).toBeInTheDocument();
        expect(
          screen.getByText(
            new RegExp(`${first} klo 11:00, ${second} klo 13:00`, 'i'),
          ),
        ).toBeInTheDocument();
      },
    );
  },
);
