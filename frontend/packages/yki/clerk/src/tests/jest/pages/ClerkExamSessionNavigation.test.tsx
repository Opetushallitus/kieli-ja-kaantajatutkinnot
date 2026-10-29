import { configureStore, Tuple } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router';
import createSagaMiddleware from 'redux-saga';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkRegisterOrganizerDetails } from 'components/clerkRegister/ClerkRegisterOrganizerDetails';
import { ClerkRegisterListing } from 'components/clerkRegister/listing/ClerkRegisterListing';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { RouteType } from 'interfaces/user';
import { ClerkExamSessionPage } from 'pages/ClerkExamSessionPage';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import { acceptUser } from 'redux/reducers/user';
import rootSaga from 'redux/sagas';
import { rootReducer } from 'redux/store';
import { organizers } from 'tests/msw/fixtures/organizers';
import { server } from 'tests/msw/server';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

const organizer = SerializationUtils.deserializeClerkOrganizerResponse(
  organizers.organizers[0],
);
const matchedPaths: string[] = [];
const recordMatchedRequest = ({ request }: { request: Request }) => {
  matchedPaths.push(new URL(request.url).pathname);
};
const unhandledRequest = jest.fn();
let dispose: () => void;

beforeAll(async () => {
  await use(initReactI18next).init({
    lng: 'fi-FI',
    defaultNS: 'common',
    fallbackLng: 'fi-FI',
    resources: { 'fi-FI': { public: publicFI, common: commonFI } },
  });
  DateUtils.setDayjsLocale(AppLanguage.Finnish);
});

beforeEach(() => {
  jest.useFakeTimers({
    now: new Date('2026-10-29T12:00:00'),
    advanceTimers: true,
  });
  matchedPaths.length = 0;
  unhandledRequest.mockClear();
  server.events.on('request:match', recordMatchedRequest);
  server.events.on('request:unhandled', unhandledRequest);
});

afterEach(() => {
  dispose();
  server.events.removeListener('request:match', recordMatchedRequest);
  server.events.removeListener('request:unhandled', unhandledRequest);
  jest.useRealTimers();
});

const renderNavigation = (route: RouteType) => {
  // Give each integration test its own saga task and cancel it on cleanup.
  const saga = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    middleware: () => new Tuple(saga),
  });
  const sagaTask = saga.run(rootSaga);
  store.dispatch(
    acceptUser({
      oid: organizer.oid,
      isAdmin: route === 'clerk',
      isOrganizer: route === 'organizer',
      isCustomerService: false,
    }),
  );
  const listingPath =
    route === 'clerk'
      ? AppRoutes.ClerkOrganizerRegister
      : AppRoutes.OrganizerHome.replace(':oid', organizer.oid);
  window.history.replaceState({}, '', listingPath);
  const router = createBrowserRouter([
    {
      path: AppRoutes.ClerkOrganizerRegister,
      element: <ClerkRegisterListing page={1} setPage={jest.fn()} />,
    },
    {
      path: AppRoutes.OrganizerHome,
      element: (
        <ClerkRegisterOrganizerDetails row={organizer} route="organizer" />
      ),
    },
    {
      path: AppRoutes.ClerkExamSession,
      element: <ClerkExamSessionPage route="clerk" />,
    },
    {
      path: AppRoutes.OrganizerExamSession,
      element: <ClerkExamSessionPage route="organizer" />,
    },
  ]);
  dispose = () => {
    router.dispose();
    sagaTask.cancel();
    window.history.replaceState({}, '', '/');
  };
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );

  return router;
};

describe.each<RouteType>(['clerk', 'organizer'])(
  '%s session navigation with MSW',
  (route) => {
    it.each([
      {
        id: 999,
        date: '1.1.2035',
        deadline: '25.12.2034',
        ended: false,
        first: null,
        second: null,
      },
      {
        id: 1000,
        date: '15.1.2035',
        deadline: '8.1.2035',
        ended: false,
        first: 'Tekstin ymmärtäminen',
        second: 'Puhuminen',
      },
      {
        id: 1001,
        date: '1.11.2026',
        deadline: '25.10.2026',
        ended: true,
        first: 'Puheen ymmärtäminen',
        second: 'Kirjoittaminen',
      },
    ])(
      'opens session $id from the listing using the correct role endpoint',
      async ({ id, date, deadline, ended, first, second }) => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const router = renderNavigation(route);
        if (route === 'clerk') {
          const organizerRow = (await screen.findByText('Taitotalo')).closest(
            'tr',
          );
          expect(organizerRow).not.toBeNull();
          await user.click(within(organizerRow!).getByLabelText('expand row'));
        }
        const sessionPath =
          route === 'clerk'
            ? AppRoutes.ClerkExamSession.replace(':id', String(id))
            : AppRoutes.OrganizerExamSession.replace(
                ':oid',
                organizer.oid,
              ).replace(':id', String(id));
        const link = (await screen.findAllByRole('link', { name: date })).find(
          (element) => element.getAttribute('href') === sessionPath,
        );
        expect(link).toBeDefined();
        await user.click(link!);
        expect(
          await screen.findByRole('button', { name: 'Ilmoittautuneet (5)' }),
        ).toBeInTheDocument();
        expect(router.state.location.pathname).toBe(sessionPath);
        expect(screen.getByText(deadline)).toBeInTheDocument();
        expect(!!screen.queryByText('Jonotus päättynyt')).toBe(ended);
        if (first && second) {
          expect(screen.getByText(`${first}: 12`)).toBeInTheDocument();
          expect(screen.getByText(`${second}: 8`)).toBeInTheDocument();
          expect(screen.getByText(`${first}: 4 / 12`)).toBeInTheDocument();
          expect(screen.getByText(`${second}: 3 / 8`)).toBeInTheDocument();
        } else {
          expect(screen.getAllByText('Kaikki osakokeet')).toHaveLength(5);
        }
        expect(
          within(screen.getByRole('table')).getAllByRole('link'),
        ).toHaveLength(5);
        expect(
          screen.getByRole('button', { name: 'Jonossa (2)' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Maksanut ja peruttu (1)' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Peruttu tai erääntynyt (3)' }),
        ).toBeInTheDocument();
        expect(matchedPaths).toContain(
          APIEndpoints.OrganizerExamSession.replace(':oid', organizer.oid),
        );
        const clerkEndpoint = APIEndpoints.ClerkExamSession.replace(
          ':id',
          String(id),
        );
        const organizerEndpoint = `${APIEndpoints.OrganizerExamSession.replace(':oid', organizer.oid)}/${id}`;
        expect(matchedPaths).toContain(
          route === 'clerk' ? clerkEndpoint : organizerEndpoint,
        );
        expect(matchedPaths).not.toContain(
          route === 'clerk' ? organizerEndpoint : clerkEndpoint,
        );
        expect(unhandledRequest).not.toHaveBeenCalled();
      },
    );
  },
);
