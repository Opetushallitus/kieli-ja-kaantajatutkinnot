import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import {
  ExamSessionType,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { ClerkRegistration } from 'interfaces/clerkRegistration';
import { RouteType } from 'interfaces/user';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { registrations } from 'tests/msw/fixtures/clerkExamSessionRegistrations';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

const registration = (
  id: number,
  state: RegistrationStates,
  kind = RegistrationKind.Admission,
): ClerkRegistration => ({
  ...registrations[0],
  id,
  state,
  kind,
  person: { ...registrations[0].person, firstName: `Person${id}` },
  registrationDate: dayjs('2026-10-01'),
  queuePosition: kind === RegistrationKind.Queue ? id : null,
});

const examSession = {
  ...SerializationUtils.deserializeClerkExamSessionResponse(clerkExamSession),
  registrations: [
    registration(1, RegistrationStates.Completed),
    registration(2, RegistrationStates.Submitted),
    registration(3, RegistrationStates.Submitted, RegistrationKind.Queue),
    registration(4, RegistrationStates.PaidAndCancelled),
    registration(5, RegistrationStates.Cancelled),
    registration(6, RegistrationStates.Cancelled, RegistrationKind.Queue),
    registration(7, RegistrationStates.Expired),
    registration(8, RegistrationStates.Started),
  ],
};

beforeAll(async () => {
  await use(initReactI18next).init({
    lng: 'fi-FI',
    fallbackLng: 'fi-FI',
    resources: { 'fi-FI': { public: publicFI, common: commonFI } },
  });
});

const participantNames = () =>
  within(screen.getByRole('table'))
    .queryAllByRole('link')
    .map((link) => link.textContent);

describe.each<RouteType>(['clerk', 'organizer'])(
  '%s exam registrations',
  (route) => {
    it('separates active admissions, queue, paid cancellations and other inactive registrations', async () => {
      const user = userEvent.setup();
      render(
        <DefaultProviders>
          <ClerkExamSessionRegistrations
            examSession={examSession}
            route={route}
          />
        </DefaultProviders>,
      );

      expect(
        screen.getByRole('button', { name: 'Ilmoittautuneet (2)' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(participantNames()).toEqual([
        'Person1 Testaaja',
        'Person2 Testaaja',
      ]);

      await user.click(screen.getByRole('button', { name: 'Jonossa (1)' }));
      expect(participantNames()).toEqual(['Person3 Testaaja']);
      expect(
        within(screen.getByRole('table')).getAllByRole('columnheader'),
      ).toHaveLength(route === 'organizer' ? 6 : 5);

      await user.click(
        screen.getByRole('button', { name: 'Maksanut ja peruttu (1)' }),
      );
      expect(participantNames()).toEqual(['Person4 Testaaja']);

      await user.click(
        screen.getByRole('button', { name: 'Peruttu tai erääntynyt (3)' }),
      );
      expect(participantNames()).toEqual([
        'Person5 Testaaja',
        'Person6 Testaaja',
        'Person7 Testaaja',
      ]);
      expect(screen.getByText('Peruttu')).toBeInTheDocument();
      expect(screen.getByText('Jonotus peruttu')).toBeInTheDocument();
      expect(screen.getByText('Erääntynyt')).toBeInTheDocument();
      expect(screen.queryByText('Peru osallistuminen')).not.toBeInTheDocument();
    });
    it('labels full exams as all subtests without redundant participant counts', () => {
      render(
        <DefaultProviders>
          <ClerkExamSessionRegistrations
            examSession={examSession}
            route={route}
          />
        </DefaultProviders>,
      );
      expect(screen.getAllByText('Kaikki osakokeet')).toHaveLength(2);
      expect(screen.queryByText('Koko tutkinto')).not.toBeInTheDocument();
      expect(screen.queryByText(/Ilmoittautuneita:/)).not.toBeInTheDocument();
    });

    it.each([
      {
        type: ExamSessionType.READ_SPEAK,
        first: 'READ',
        second: 'SPEAK',
        firstLabel: 'Tekstin ymmärtäminen',
        secondLabel: 'Puhuminen',
        combinedLabel: 'Tekstin ymmärtäminen ja puhuminen',
      },
      {
        type: ExamSessionType.LISTEN_WRITE,
        first: 'LISTEN',
        second: 'WRITE',
        firstLabel: 'Puheen ymmärtäminen',
        secondLabel: 'Kirjoittaminen',
        combinedLabel: 'Puheen ymmärtäminen ja kirjoittaminen',
      },
    ])(
      'counts only active admissions, including combinations for $type',
      async ({
        type,
        first,
        second,
        firstLabel,
        secondLabel,
        combinedLabel,
      }) => {
        const user = userEvent.setup();
        render(
          <DefaultProviders>
            <ClerkExamSessionRegistrations
              examSession={{
                ...examSession,
                type,
                registrations: [
                  ...examSession.registrations,
                  {
                    ...registration(9, RegistrationStates.Completed),
                    partialExamType: first,
                  },
                  {
                    ...registration(10, RegistrationStates.Submitted),
                    partialExamType: second,
                  },
                ],
              }}
              route={route}
            />
          </DefaultProviders>,
        );
        expect(screen.getByText(`${firstLabel}: 3 / 10`)).toBeInTheDocument();
        expect(screen.getByText(`${secondLabel}: 3 / 10`)).toBeInTheDocument();
        expect(screen.getByText(`${combinedLabel}: 2`)).toBeInTheDocument();
        expect(screen.getAllByText(combinedLabel)).toHaveLength(2);
        await user.click(screen.getByRole('button', { name: 'Jonossa (1)' }));
        expect(
          screen.queryByText(`${combinedLabel}: 2`),
        ).not.toBeInTheDocument();
      },
    );
  },
);
