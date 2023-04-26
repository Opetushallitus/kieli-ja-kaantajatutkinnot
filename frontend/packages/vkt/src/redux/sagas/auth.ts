import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { call, put, takeLeading } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { setAPIError } from 'redux/reducers/APIError';
import {
  authenticationSucceeded,
  rejectAuthentication,
  startAuthentication,
} from 'redux/reducers/auth';
import { NotifierUtils } from 'utils/notifier';

function* startAuthenticationSaga(action: PayloadAction<string>) {
  try {
    yield call(
      axiosInstance.get,
      `${APIEndpoints.PublicValidateTicket}/${action.payload}`
    );
    yield put(authenticationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthentication());
  }
}

export function* watchAuth() {
  yield takeLeading(startAuthentication.type, startAuthenticationSaga);
}
