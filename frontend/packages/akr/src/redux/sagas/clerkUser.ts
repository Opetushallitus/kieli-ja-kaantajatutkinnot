import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';
import { HTTPStatusCode } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkUser } from 'interfaces/clerkUser';
import {
  loadClerkUser,
  rejectClerkUser,
  storeClerkUser,
} from 'redux/reducers/clerkUser';

function* loadClerkUserSaga() {
  try {
    const response: AxiosResponse<ClerkUser> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkUser,
    );

    if (response.status === HTTPStatusCode.Ok) {
      yield put(storeClerkUser(response.data));
    } else {
      yield put(rejectClerkUser());
    }
  } catch (error) {
    yield put(rejectClerkUser());
  }
}

export function* watchClerkUser() {
  yield takeLatest(loadClerkUser.type, loadClerkUserSaga);
}
