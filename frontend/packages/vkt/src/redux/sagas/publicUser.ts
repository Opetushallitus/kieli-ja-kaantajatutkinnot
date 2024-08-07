import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';
import { HTTPStatusCode } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicPerson } from 'interfaces/publicPerson';
import {
  loadPublicUser,
  rejectPublicUser,
  storePublicUser,
} from 'redux/reducers/publicUser';

function* loadPublicUserSaga() {
  try {
    const response: AxiosResponse<PublicPerson> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicUser,
    );

    if (response.status === HTTPStatusCode.Ok && response.data) {
      yield put(storePublicUser(response.data));
    } else {
      yield put(rejectPublicUser());
    }
  } catch (error) {}
}

export function* watchPublicUser() {
  yield takeLatest(loadPublicUser.type, loadPublicUserSaga);
}
