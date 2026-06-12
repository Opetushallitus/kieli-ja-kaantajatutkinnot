import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { User } from 'interfaces/session';
import { acceptUser, loadUser, rejectUser } from 'redux/reducers/user';

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

export function* watchUser() {
  yield takeLatest(loadUser.type, loadUserSaga);
}
