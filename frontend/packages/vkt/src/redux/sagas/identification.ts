import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  identificationSucceeded,
  rejectIdentification,
  startIdentification,
} from 'redux/reducers/identification';

function* identificationSaga() {
  try {
    yield call(axiosInstance.get, APIEndpoints.PublicIdentification);
    yield put(identificationSucceeded());
  } catch (error) {
    yield put(rejectIdentification());
  }
}

export function* watchIdentification() {
  yield takeLatest(startIdentification.type, identificationSaga);
}
