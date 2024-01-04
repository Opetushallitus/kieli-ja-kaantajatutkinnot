import { call, delay, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';
import dayjs, { Dayjs } from 'dayjs';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  UserOpenRegistration,
  UserOpenRegistrationsResponse,
} from 'interfaces/publicRegistration';
import {
  acceptUserOpenRegistrations,
  loadUserOpenRegistrations,
  rejectUserOpenRegistrations,
  resetUserOpenRegistrations,
} from 'redux/reducers/userOpenRegistrations';

function* loadUserOpenRegistrationsSaga() {
  try {
    const response: AxiosResponse<UserOpenRegistrationsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.OpenRegistrations
    );
    yield put(acceptUserOpenRegistrations(response.data));

    // Reset known open registrations after the first expires,
    // possibly triggering a new API call
    const maxPossibleExpiry = dayjs().add(30, 'minute');
    const nextToExpire: Dayjs = response.data.open_registrations.reduce(
      (min: Dayjs, reg: UserOpenRegistration) => {
        const expires_at = dayjs(reg.expires_at);

        return expires_at < min ? expires_at : min;
      },
      maxPossibleExpiry
    );

    // When expiry is very close or in the past, check every minute
    const expires_in = Math.max(60 * 1000, nextToExpire.diff(dayjs()));

    // Check at least every 10 minutes
    const refreshDelay = Math.min(10 * 60 * 1000, expires_in);

    yield delay(refreshDelay);
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    yield put(rejectUserOpenRegistrations());
  }
}

export function* watchUserOpenRegistrations() {
  yield takeLatest(
    loadUserOpenRegistrations.type,
    loadUserOpenRegistrationsSaga
  );
}
