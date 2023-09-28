import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { SessionResponse } from 'interfaces/session';
import {
  acceptSession,
  loadSession,
  rejectSession,
} from 'redux/reducers/session';

function* loadSessionSaga() {
  try {
    const response: AxiosResponse<SessionResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.User
    );
    yield put(acceptSession(response.data));
  } catch (error) {
    yield put(rejectSession());
  }
}

export function* watchSession() {
  yield takeLatest(loadSession.type, loadSessionSaga);
}
