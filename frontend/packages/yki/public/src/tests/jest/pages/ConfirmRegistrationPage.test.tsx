import createSagaMiddleware from '@redux-saga/core';
import { configureStore, Tuple } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { APIResponseStatus, AppLanguage } from 'shared/enums';

import { changeLang } from 'configs/i18n';
import { RootState } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { YkiThemeProvider } from 'ophTheme/YkiThemeProvider';
import { ConfirmRegistrationPage } from 'pages/ConfirmRegistrationPage';
import rootSaga from 'redux/sagas';
import { rootReducer } from 'redux/store';
import {
  emailPaymentConfirmation,
  emailPaymentExamSession,
  emailPaymentRegistration,
} from 'tests/msw/fixtures/emailPaymentLink';
import { server } from 'tests/msw/server';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

let cancelSaga: () => void;
const sessionRequests = jest.fn();

const renderEmailPaymentLink = (preloadedState: Partial<RootState> = {}) => {
  const saga = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    middleware: () => new Tuple(saga),
    preloadedState: {
      session: {
        status: APIResponseStatus.Success,
        loggedInSession: {
          'auth-method': 'EMAIL' as const,
          identity: {
            'external-user-id': 'test@example.invalid',
            email: 'test@example.invalid',
          },
        },
      },
      ...preloadedState,
    },
  });
  const task = saga.run(rootSaga);
  cancelSaga = () => task.cancel();

  render(
    <Provider store={store}>
      <YkiThemeProvider>
        <MemoryRouter initialEntries={['/yki/kayttaja/vahvista/191918']}>
          <Routes>
            <Route
              path={AppRoutes.ConfirmRegistration}
              element={<ConfirmRegistrationPage />}
            />
          </Routes>
        </MemoryRouter>
      </YkiThemeProvider>
    </Provider>,
  );

  return store;
};

beforeEach(async () => {
  await changeLang(AppLanguage.Finnish);
  sessionRequests.mockClear();
  server.use(
    http.get(APIEndpoints.Registration, () =>
      HttpResponse.json(emailPaymentRegistration),
    ),
    http.get(APIEndpoints.ConfirmRegistration, () =>
      HttpResponse.json(emailPaymentConfirmation),
    ),
    http.get(APIEndpoints.ExamSession, ({ params }) => {
      sessionRequests(params.examSessionId);

      return HttpResponse.json(emailPaymentExamSession);
    }),
  );
});

afterEach(() => cancelSaga?.());

describe('payment confirmation opened directly from email', () => {
  it('shows the listening fee instead of undefined or the outdated full-exam fee', async () => {
    const store = renderEmailPaymentLink();
    await screen.findByRole('button', { name: 'Maksa tutkintomaksu' });

    expect(
      screen.getByText('Tutkintomaksu').nextElementSibling,
    ).toHaveTextContent('43 €');
    expect(screen.queryByText('undefined €')).not.toBeInTheDocument();
    expect(screen.queryByText('190 €')).not.toBeInTheDocument();
    expect(sessionRequests).toHaveBeenCalledWith('188');
    expect(store.getState().userDetails.personDetails).toBeUndefined();
  });

  it('shows the listening start time instead of just klo', async () => {
    renderEmailPaymentLink();
    await screen.findByRole('button', { name: 'Maksa tutkintomaksu' });

    expect(
      screen.getByText('Testin alkamisaika').nextElementSibling,
    ).toHaveTextContent('klo 09:00');
    expect(screen.getByText('Osakokeet').nextElementSibling).toHaveTextContent(
      'Puheen ymmärtäminen',
    );
    expect(screen.queryByText('klo', { exact: true })).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Maksa tutkintomaksu' }),
    ).toHaveAttribute(
      'href',
      '/yki/api/person/registration/191918/payment-redirect?lang=fi',
    );
    await waitFor(() => expect(sessionRequests).toHaveBeenCalledTimes(1));
  });

  it.each([
    ['LISTEN_WRITE', 'WRITE', '70 €', 'klo 13:00', 'Kirjoittaminen'],
    [
      'LISTEN_WRITE',
      'ALL_PARTS',
      '113 €',
      'klo 09:00',
      'Puheen ymmärtäminen ja kirjoittaminen',
    ],
    ['READ_SPEAK', 'READ', '43 €', 'klo 09:00', 'Tekstin ymmärtäminen'],
    ['READ_SPEAK', 'SPEAK', '84 €', 'klo 13:00', 'Puhuminen'],
    [
      'READ_SPEAK',
      'ALL_PARTS',
      '127 €',
      'klo 09:00',
      'Tekstin ymmärtäminen ja puhuminen',
    ],
    [
      'FULL',
      'ALL_PARTS',
      '190 €',
      undefined,
      'Puheen ymmärtäminen, puhuminen, tekstin ymmärtäminen, kirjoittaminen',
    ],
  ] as const)(
    'shows the fee and time for %s / %s',
    async (type, part, fee, time, label) => {
      server.use(
        http.get(APIEndpoints.Registration, () =>
          HttpResponse.json({
            ...emailPaymentRegistration,
            partial_exam_type: part,
          }),
        ),
        http.get(APIEndpoints.ExamSession, () =>
          HttpResponse.json({
            ...emailPaymentExamSession,
            type,
            partial_registration_kind: {
              ALL_PARTS: 'ADMISSION',
              [part]: 'ADMISSION',
            },
          }),
        ),
      );
      renderEmailPaymentLink();
      await screen.findByRole('button', { name: 'Maksa tutkintomaksu' });

      expect(
        screen.getByText('Tutkintomaksu').nextElementSibling,
      ).toHaveTextContent(fee);
      expect(
        screen.getByText('Osakokeet').nextElementSibling,
      ).toHaveTextContent(label);
      if (time) {
        expect(
          screen.getByText('Testin alkamisaika').nextElementSibling,
        ).toHaveTextContent(time);
      } else {
        expect(
          screen.queryByText('Testin alkamisaika'),
        ).not.toBeInTheDocument();
      }
    },
  );

  it('replaces a different session left in the store by a previous visit', async () => {
    renderEmailPaymentLink({
      examSession: {
        status: APIResponseStatus.Success,
        examSession: SerializationUtils.deserializeExamSessionResponse({
          ...emailPaymentExamSession,
          id: 187,
          start_time_read_listen: '18:00',
        }),
      },
    });
    await screen.findByRole('button', { name: 'Maksa tutkintomaksu' });

    expect(screen.getByText('klo 09:00')).toBeVisible();
    expect(screen.queryByText('klo 18:00')).not.toBeInTheDocument();
    expect(sessionRequests).toHaveBeenCalledWith('188');
  });

  it('waits for the session details before showing the payment contents', async () => {
    let releaseSession!: () => void;
    const pendingSession = new Promise<void>((resolve) => {
      releaseSession = resolve;
    });
    server.use(
      http.get(APIEndpoints.ExamSession, async () => {
        sessionRequests();
        await pendingSession;

        return HttpResponse.json(emailPaymentExamSession);
      }),
    );
    renderEmailPaymentLink();

    try {
      await waitFor(() => expect(sessionRequests).toHaveBeenCalled());
      expect(
        screen.queryByRole('button', { name: 'Maksa tutkintomaksu' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('undefined €')).not.toBeInTheDocument();
      expect(
        screen.queryByText('klo', { exact: true }),
      ).not.toBeInTheDocument();
    } finally {
      releaseSession();
    }

    await screen.findByRole('button', { name: 'Maksa tutkintomaksu' });
    expect(screen.getByText('43 €')).toBeVisible();
    expect(screen.getByText('klo 09:00')).toBeVisible();
  });

  it('handles a failed session request without displaying incomplete payment details or retrying endlessly', async () => {
    server.use(
      http.get(APIEndpoints.ExamSession, () => {
        sessionRequests();

        return new HttpResponse(null, { status: 500 });
      }),
    );
    const store = renderEmailPaymentLink();

    await waitFor(() =>
      expect(store.getState().examSession.status).toBe(APIResponseStatus.Error),
    );
    expect(store.getState().APIError.message).toBeTruthy();
    expect(sessionRequests).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Maksa tutkintomaksu' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('undefined €')).not.toBeInTheDocument();
  });
});
