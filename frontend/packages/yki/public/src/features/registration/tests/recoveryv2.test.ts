import { waitFor } from '@testing-library/react';
import { AxiosError, AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import axios from 'configs/axios';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import { RegistrationContext } from 'features/registration/modelv2';
import {
  acceptPublicRegistrationInit,
  cancelRegistration,
  initRegistration,
  requestStep,
  resetPublicRegistration,
  retryStep,
  submitPublicRegistration,
  updatePublicRegistration,
} from 'features/registration/redux/reducers/registrationv2';
import { setupStore } from 'features/registration/redux/store/indexv2';
import { registrationFixture } from 'features/registration/tests/handlersv2';

const response = (data: RegistrationContext) =>
  ({ data }) as AxiosResponse<RegistrationContext>;
const failure = (status: number, data: unknown = null) =>
  new AxiosError('request failed', undefined, undefined, undefined, {
    status,
    data,
  } as AxiosResponse);
const page = (registrationId = 501, requestKey = 'first') => ({
  examSessionId: 100,
  registrationId,
  requestKey,
  step: 'Register' as const,
});
const submitted = () =>
  registrationFixture({
    state: RegistrationStates.Completed,
    is_free: true,
    reservation_expires_at: null,
  });
const pendingRequest = () => {
  let resolve!: (value: AxiosResponse<RegistrationContext>) => void;
  const promise = new Promise<AxiosResponse<RegistrationContext>>((done) => {
    resolve = done;
  });

  return { promise, resolve };
};
const loadedStore = () => {
  const store = setupStore();
  store.dispatch(acceptPublicRegistrationInit(registrationFixture()));
  store.dispatch(
    updatePublicRegistration({
      phoneNumber: '+358401234567',
      email: 'edited@example.invalid',
    }),
  );

  return store;
};
afterEach(() => jest.restoreAllMocks());

it('retries a failed GET on the same history entry once, retaining the draft', async () => {
  const pending = pendingRequest();
  const get = jest
    .spyOn(axios, 'get')
    .mockRejectedValueOnce(failure(503))
    .mockReturnValueOnce(pending.promise);
  const store = loadedStore();
  store.dispatch(requestStep(page()));
  await waitFor(() =>
    expect(store.getState().registration.loadError).toBe('network'),
  );
  store.dispatch(requestStep(page()));
  expect(get).toHaveBeenCalledTimes(1);
  store.dispatch(retryStep(page()));
  store.dispatch(retryStep(page()));
  expect(get).toHaveBeenCalledTimes(2);
  pending.resolve(response(registrationFixture()));
  await waitFor(() =>
    expect(store.getState().registration.fetchRegistrationStatus).toBe(
      APIResponseStatus.Success,
    ),
  );
  expect(store.getState().registration.registration.phoneNumber).toBe(
    '+358401234567',
  );
  expect(store.getState().registration.registration.email).toBe(
    'edited@example.invalid',
  );
});

it.each([401, 403, 404, 410])(
  'does not retry a terminal GET failure %s',
  async (status) => {
    const get = jest.spyOn(axios, 'get').mockRejectedValueOnce(failure(status));
    const store = setupStore();
    store.dispatch(requestStep(page()));
    await waitFor(() =>
      expect(store.getState().registration.fetchRegistrationStatus).toBe(
        APIResponseStatus.Error,
      ),
    );
    store.dispatch(retryStep(page()));
    expect(get).toHaveBeenCalledTimes(1);
  },
);

it.each([
  ['closed', PublicRegistrationFormSubmitError.RegistrationPeriodClosed],
  ['expired', PublicRegistrationFormSubmitError.FormExpired],
  ['registered', PublicRegistrationFormSubmitError.AlreadyRegistered],
  ['create_payment', PublicRegistrationFormSubmitError.PaymentCreationFailed],
  ['person_creation', PublicRegistrationFormSubmitError.PersonCreationFailed],
])(
  'maps submit error %s and clears it on an unrelated failure',
  async (flag, expected) => {
    jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce(failure(409, { error: { [flag]: true } }))
      .mockRejectedValueOnce(failure(500, '<html>error</html>'));
    const store = loadedStore();
    store.dispatch(submitPublicRegistration());
    await waitFor(() =>
      expect(store.getState().registration.submitRegistration.error).toBe(
        expected,
      ),
    );
    store.dispatch(submitPublicRegistration());
    expect(
      store.getState().registration.submitRegistration.error,
    ).toBeUndefined();
    await waitFor(() =>
      expect(store.getState().registration.submitRegistration.status).toBe(
        APIResponseStatus.Error,
      ),
    );
    expect(
      store.getState().registration.submitRegistration.error,
    ).toBeUndefined();
    expect(store.getState().registration.registration.phoneNumber).toBe(
      '+358401234567',
    );
  },
);

it('retries submission with the edited draft after a recoverable failure', async () => {
  const post = jest
    .spyOn(axios, 'post')
    .mockRejectedValueOnce(failure(500))
    .mockResolvedValueOnce(response(submitted()));
  const store = loadedStore();
  store.dispatch(submitPublicRegistration());
  await waitFor(() =>
    expect(store.getState().registration.submitRegistration.status).toBe(
      APIResponseStatus.Error,
    ),
  );
  store.dispatch(submitPublicRegistration());
  await waitFor(() =>
    expect(store.getState().registration.submitRegistration.status).toBe(
      APIResponseStatus.Success,
    ),
  );
  expect(post.mock.calls[1][1]).toMatchObject({
    phone_number: '+358401234567',
    email: 'edited@example.invalid',
  });
});

it.each(['submit', 'cancel'])(
  'drops duplicate and conflicting commands during %s',
  async (command) => {
    const pending = pendingRequest();
    const post = jest.spyOn(axios, 'post').mockReturnValue(pending.promise);
    const remove = jest.spyOn(axios, 'delete').mockReturnValue(pending.promise);
    const store = loadedStore();
    const first =
      command === 'submit' ? submitPublicRegistration : cancelRegistration;
    const other =
      command === 'submit' ? cancelRegistration : submitPublicRegistration;
    store.dispatch(first());
    store.dispatch(first());
    store.dispatch(other());
    expect(post).toHaveBeenCalledTimes(command === 'submit' ? 1 : 0);
    expect(remove).toHaveBeenCalledTimes(command === 'cancel' ? 1 : 0);
    pending.resolve(response(submitted()));
    await waitFor(() =>
      expect(
        command === 'submit'
          ? store.getState().registration.submitRegistration.status
          : store.getState().registration.cancelRegistration.status,
      ).toBe(APIResponseStatus.Success),
    );
  },
);

it.each(['submit', 'cancel'])(
  'ignores a late %s response after switching registrations and clears pending status',
  async (command) => {
    const pending = pendingRequest();
    jest
      .spyOn(axios, command === 'submit' ? 'post' : 'delete')
      .mockReturnValue(pending.promise);
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce(
        response(registrationFixture({ registration_id: 502 })),
      );
    const store = loadedStore();
    store.dispatch(
      command === 'submit' ? submitPublicRegistration() : cancelRegistration(),
    );
    store.dispatch(requestStep(page(502, 'second')));
    await waitFor(() =>
      expect(store.getState().registration.context?.registration_id).toBe(502),
    );
    pending.resolve(response(submitted()));
    await pending.promise;
    expect(store.getState().registration.context?.registration_id).toBe(502);
    expect(store.getState().registration.submitRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
    expect(store.getState().registration.cancelRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
  },
);

it.each(['submit', 'cancel'])(
  'rereads the same registration during pending %s without leaving controls stuck',
  async (command) => {
    const pending = pendingRequest();
    jest
      .spyOn(axios, command === 'submit' ? 'post' : 'delete')
      .mockReturnValue(pending.promise);
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce(response(registrationFixture()));
    const store = loadedStore();
    store.dispatch(
      command === 'submit' ? submitPublicRegistration() : cancelRegistration(),
    );
    store.dispatch(requestStep(page(501, 'new-entry')));
    await waitFor(() =>
      expect(store.getState().registration.fetchRegistrationStatus).toBe(
        APIResponseStatus.Success,
      ),
    );
    pending.resolve(response(submitted()));
    await pending.promise;
    expect(store.getState().registration.context?.state).toBe(
      RegistrationStates.Started,
    );
    expect(store.getState().registration.submitRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
    expect(store.getState().registration.cancelRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
    expect(store.getState().registration.registration.email).toBe(
      'edited@example.invalid',
    );
  },
);

it('ignores a pending submission after reset', async () => {
  const pending = pendingRequest();
  jest.spyOn(axios, 'post').mockReturnValue(pending.promise);
  const store = loadedStore();
  store.dispatch(submitPublicRegistration());
  store.dispatch(resetPublicRegistration());
  pending.resolve(response(submitted()));
  await pending.promise;
  expect(store.getState().registration.context).toBeUndefined();
});

it('keeps the draft and permits retry after cancellation failure', async () => {
  jest
    .spyOn(axios, 'delete')
    .mockRejectedValueOnce(failure(500))
    .mockResolvedValueOnce({ status: 204 });
  const store = loadedStore();
  store.dispatch(cancelRegistration());
  await waitFor(() =>
    expect(store.getState().registration.cancelRegistration.status).toBe(
      APIResponseStatus.Error,
    ),
  );
  expect(store.getState().registration.registration.email).toBe(
    'edited@example.invalid',
  );
  store.dispatch(cancelRegistration());
  await waitFor(() =>
    expect(store.getState().registration.cancelRegistration.status).toBe(
      APIResponseStatus.Success,
    ),
  );
});

it.each([null, '<html>error</html>'])(
  'handles init failures without an API error body: %s',
  async (data) => {
    jest.spyOn(axios, 'post').mockRejectedValueOnce(failure(500, data));
    const store = setupStore();
    store.dispatch(
      initRegistration({
        examSessionId: 100,
        partialExamType: 'READ',
        registrationKind: RegistrationKind.Admission,
      }),
    );
    await waitFor(() =>
      expect(store.getState().registration.initRegistration.error?.error).toBe(
        PublicRegistrationInitError.Generic,
      ),
    );
  },
);
