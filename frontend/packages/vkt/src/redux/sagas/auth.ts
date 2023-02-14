import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLeading } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  authenticationSucceeded,
  rejectAuthentication,
  startAuthentication,
} from 'redux/reducers/auth';

function* authSaga(action: PayloadAction<string>) {
  try {
    yield call(
      axiosInstance.get,
      `${APIEndpoints.PublicValidateTicket}/${action.payload}`
    );
    yield put(authenticationSucceeded());
  } catch (error) {
    yield put(rejectAuthentication());
  }
}

export function* watchAuth() {
  yield takeLeading(startAuthentication.type, authSaga);
}
