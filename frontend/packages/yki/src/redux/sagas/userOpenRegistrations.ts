import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { UserOpenRegistrationsResponse } from 'interfaces/publicRegistration';
import {
  acceptUserOpenRegistrations,
  loadUserOpenRegistrations,
  rejectUserOpenRegistrations,
} from 'redux/reducers/userOpenRegistrations';

function* loadUserOpenRegistrationsSaga() {
  try {
    const response: AxiosResponse<UserOpenRegistrationsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.OpenRegistrations
    );
    yield put(acceptUserOpenRegistrations(response.data));
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
