import createSagaMiddleware from '@redux-saga/core';
import { configureStore, Tuple } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { APIResponseStatus } from 'shared/enums';

import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { setPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import {
  cancelRegistration,
  fetchRegistrationDetails,
  initRegistration,
  submitPublicRegistration,
  updatePublicRegistration,
} from 'redux/reducers/registration';
import { watchRegistration } from 'redux/sagas/registration';
import { rootReducer } from 'redux/store';
import {
  registrationFixture,
  resetRegistrationMocks,
  saveRegistration,
} from 'tests/msw/registrationHandlers';
import { server } from 'tests/msw/server';

const key = { examSessionId: 100, registrationId: 501 };
const createStore = () => {
  const saga = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    middleware: () => new Tuple(saga),
  });
  const task = saga.run(watchRegistration);

  return { store, task };
};
afterEach(resetRegistrationMocks);

it('stores all init details in the existing store without a second GET', async () => {
  const data = registrationFixture();
  saveRegistration(data);
  let reads = 0;
  server.use(
    http.get(APIEndpoints.Registration, () => {
      reads++;

      return HttpResponse.json(data);
    }),
  );
  const { store, task } = createStore();
  try {
    store.dispatch(
      initRegistration({
        examSessionId: 100,
        registrationKind: RegistrationKind.Admission,
        partialExamType: 'READ',
      }),
    );
    await waitFor(() =>
      expect(store.getState().registration.initRegistration.status).toBe(
        APIResponseStatus.Success,
      ),
    );
    expect(store.getState().registration.context?.registration_id).toBe(501);
    expect(store.getState().examSession.examSession?.id).toBe(100);
    expect(store.getState().session).toEqual({
      status: APIResponseStatus.NotStarted,
    });
    expect(reads).toBe(0);
  } finally {
    task.cancel();
  }
});

it('submits the existing form draft and stores the returned payment context', async () => {
  saveRegistration(registrationFixture());
  const { store, task } = createStore();
  let payload: unknown;
  server.events.on('request:start', async ({ request }) => {
    if (request.url.endsWith('/submit')) payload = await request.clone().json();
  });
  try {
    store.dispatch(fetchRegistrationDetails(key));
    await waitFor(() =>
      expect(store.getState().registration.fetchRegistrationStatus).toBe(
        APIResponseStatus.Success,
      ),
    );
    store.dispatch(
      updatePublicRegistration({
        email: 'edited@example.invalid',
        phoneNumber: '+3581234567',
      }),
    );
    store.dispatch(submitPublicRegistration());
    await waitFor(() =>
      expect(store.getState().registration.submitRegistration.status).toBe(
        APIResponseStatus.Success,
      ),
    );
    expect(payload).toMatchObject({
      email: 'edited@example.invalid',
      phone_number: '+3581234567',
      lang: 'fi',
    });
    expect(store.getState().registration.context?.payment?.status).toBe(
      'PENDING',
    );
    expect(store.getState().registration.registration.email).toBe(
      'edited@example.invalid',
    );
  } finally {
    task.cancel();
    server.events.removeAllListeners('request:start');
  }
});

it('retains the education API before submitting a free registration', async () => {
  saveRegistration(registrationFixture());
  const { store, task } = createStore();
  const location = window.location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...location },
  });
  try {
    store.dispatch(fetchRegistrationDetails(key));
    await waitFor(() =>
      expect(store.getState().registration.fetchRegistrationStatus).toBe(
        APIResponseStatus.Success,
      ),
    );
    store.dispatch(
      setPublicFreeRegistration({
        isFree: 'YES',
        basis: { source: 'KOSKI', educationType: 'MatriculationExam' },
      }),
    );
    store.dispatch(submitPublicRegistration());
    await waitFor(() =>
      expect(store.getState().registration.context?.state).toBe(
        RegistrationStates.Completed,
      ),
    );
    expect(store.getState().registration.context?.is_free).toBe(true);
    expect(window.location.href).toBe(
      AppRoutes.FreeRegistrationSuccess.replace(
        ':examSessionId',
        '100',
      ).replace(':registrationId', '501'),
    );
  } finally {
    task.cancel();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: location,
    });
  }
});

it('cancels with both IDs and clears local registration state after 204', async () => {
  saveRegistration(registrationFixture());
  const { store, task } = createStore();
  try {
    store.dispatch(fetchRegistrationDetails(key));
    await waitFor(() =>
      expect(store.getState().registration.context).toBeDefined(),
    );
    store.dispatch(cancelRegistration());
    await waitFor(() =>
      expect(store.getState().registration.context).toBeUndefined(),
    );
    expect(store.getState().examSession.examSession).toBeUndefined();
  } finally {
    task.cancel();
  }
});
