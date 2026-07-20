import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { Me, User } from 'interfaces/session';
import {
  acceptMe,
  acceptUser,
  loadMe,
  loadUser,
  rejectMe,
  rejectUser,
} from 'redux/reducers/user';

function* loadUserSaga() {
  try {
    const response: AxiosResponse<User> = yield call(
      axiosInstance.get,
      APIEndpoints.AuthUser,
    );
    yield put(acceptUser(response.data));
  } catch (error) {
    yield put(rejectUser());
  }
}

function* loadMeSaga() {
  try {
    const response: AxiosResponse<Me> = yield call(
      axiosInstance.get,
      APIEndpoints.Me,
    );
    yield put(acceptMe(response.data));
  } catch (error) {
    yield put(rejectMe());
  }
}

export function* watchUser() {
  yield takeLatest(loadMe.type, loadMeSaga);
  yield takeLatest(loadUser.type, loadUserSaga);
}
