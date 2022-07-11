import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';
import { HTTPStatusCode } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkUser } from 'interfaces/clerkUser';
import { setClerkUser } from 'redux/actions/clerkUser';
import { CLERK_USER_ERROR, CLERK_USER_LOAD } from 'redux/actionTypes/clerkUser';

export function* fetchClerkUser() {
  try {
    const response: AxiosResponse<ClerkUser> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkUser
    );

    if (response.status === HTTPStatusCode.Ok) {
      yield put(setClerkUser(response.data));
    } else {
      yield put({ type: CLERK_USER_ERROR });
    }
  } catch (error) {
    yield put({ type: CLERK_USER_ERROR });
  }
}

export function* watchFetchClerkUser() {
  yield takeLatest(CLERK_USER_LOAD, fetchClerkUser);
}
