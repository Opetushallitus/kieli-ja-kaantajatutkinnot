import { waitFor } from '@testing-library/react';
import { AxiosError, AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import axios from 'configs/axios';
import { RegistrationKind } from 'enums/app';
import { RegistrationContext } from 'features/registration/modelv2';
import {
  acceptPublicRegistrationInit,
  initRegistration,
  requestStep,
  resetPublicRegistration,
  setHasTimerExpired,
  updatePublicRegistration,
} from 'features/registration/redux/reducers/registrationv2';
import { setupStore } from 'features/registration/redux/store/indexv2';
import { registrationFixture } from 'features/registration/tests/handlersv2';
import { WeaklyAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';

const response = (data: RegistrationContext) =>
  ({ data }) as AxiosResponse<RegistrationContext>;
const deferred = () => {
  let resolve!: (value: AxiosResponse<RegistrationContext>) => void;
  const promise = new Promise<AxiosResponse<RegistrationContext>>((done) => {
    resolve = done;
  });

  return { promise, resolve };
};
const start = (partialExamType: 'READ' | 'SPEAK' = 'READ') =>
  initRegistration({
    examSessionId: 100,
    partialExamType,
    registrationKind: RegistrationKind.Admission,
  });
const read = (registrationId: number, requestKey: string) =>
  requestStep({
    examSessionId: 100,
    registrationId,
    requestKey,
    step: 'Register',
  });
afterEach(() => jest.restoreAllMocks());

it('does not reset or change a pending selection when another start is dropped', async () => {
  const pending = deferred();
  const post = jest.spyOn(axios, 'post').mockReturnValue(pending.promise);
  const store = setupStore();
  store.dispatch(start());
  store.dispatch(start('SPEAK'));
  expect(post).toHaveBeenCalledTimes(1);
  expect(store.getState().registration.initRegistration.partialExamType).toBe(
    'READ',
  );
  pending.resolve(response(registrationFixture()));
  await waitFor(() =>
    expect(store.getState().registration.context?.registration_id).toBe(501),
  );
});

it('accepts an explicit retry after an init conflict without mutating frozen initial state', async () => {
  const post = jest
    .spyOn(axios, 'post')
    .mockRejectedValueOnce(
      new AxiosError('full', undefined, undefined, undefined, {
        status: 409,
        data: { error: { full: true } },
      } as AxiosResponse),
    )
    .mockResolvedValueOnce(
      response(
        registrationFixture({ registration_kind: RegistrationKind.Queue }),
      ),
    );
  const store = setupStore();
  store.dispatch(start());
  await waitFor(() =>
    expect(store.getState().registration.initRegistration.status).toBe(
      APIResponseStatus.Error,
    ),
  );
  store.dispatch(
    initRegistration({
      examSessionId: 100,
      partialExamType: 'READ',
      registrationKind: RegistrationKind.Queue,
    }),
  );
  await waitFor(() =>
    expect(store.getState().registration.context?.registration_kind).toBe(
      RegistrationKind.Queue,
    ),
  );
  expect(post).toHaveBeenCalledTimes(2);
});

it('deduplicates the same page entry and ignores a late response for another registration', async () => {
  const pending = deferred();
  const get = jest
    .spyOn(axios, 'get')
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(
      response(
        registrationFixture({
          registration_id: 502,
          partial_exam_type: 'SPEAK',
        }),
      ),
    );
  const store = setupStore();
  store.dispatch(read(501, 'first'));
  store.dispatch(read(501, 'first'));
  expect(get).toHaveBeenCalledTimes(1);
  store.dispatch(read(502, 'second'));
  await waitFor(() =>
    expect(store.getState().registration.context?.registration_id).toBe(502),
  );
  pending.resolve(response(registrationFixture()));
  await pending.promise;
  expect(store.getState().registration.context?.registration_id).toBe(502);
  expect(store.getState().registration.context?.partial_exam_type).toBe(
    'SPEAK',
  );
});

it('discards an init response after leaving the flow', async () => {
  const pending = deferred();
  jest.spyOn(axios, 'post').mockReturnValue(pending.promise);
  const store = setupStore();
  store.dispatch(start());
  store.dispatch(resetPublicRegistration());
  pending.resolve(response(registrationFixture()));
  await pending.promise;
  expect(store.getState().registration.context).toBeUndefined();
  expect(store.getState().registration.startNavigation).toBe(false);
});

it('rejects a response whose registration ID differs from the route', async () => {
  jest
    .spyOn(axios, 'get')
    .mockResolvedValueOnce(
      response(registrationFixture({ registration_id: 502 })),
    );
  const store = setupStore();
  store.dispatch(read(501, 'first'));
  await waitFor(() =>
    expect(store.getState().registration.loadError).toBe('network'),
  );
  expect(store.getState().registration.context).toBeUndefined();
});

it('hydrates a new email identity while preserving edits on an unchanged context', () => {
  const store = setupStore();
  const anonymous = registrationFixture({
    is_strongly_identified: false,
    user: {},
    session: { identity: null },
  });
  store.dispatch(acceptPublicRegistrationInit(anonymous));
  const identified = {
    ...anonymous,
    user: { email: 'test@example.invalid' },
    session: WeaklyAuthenticatedSessionResponse,
  };
  store.dispatch(acceptPublicRegistrationInit(identified));
  expect(store.getState().registration.registration.email).toBe(
    'test@example.invalid',
  );
  store.dispatch(updatePublicRegistration({ phoneNumber: '+358401234567' }));
  store.dispatch(acceptPublicRegistrationInit(identified));
  expect(store.getState().registration.registration.phoneNumber).toBe(
    '+358401234567',
  );
  store.dispatch(setHasTimerExpired(true));
  store.dispatch(
    acceptPublicRegistrationInit({ ...identified, registration_id: 502 }),
  );
  expect(store.getState().registration.hasTimerExpired).toBe(false);
  expect(
    store.getState().registration.registration.phoneNumber,
  ).toBeUndefined();
});
