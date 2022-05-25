import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import {
  loadingPublicInterpretersFailed,
  loadPublicInterpreters,
  storePublicInterpreters,
} from 'redux/reducers/publicInterpreter';

function* fetchPublicInterpreters() {
  try {
    const response: AxiosResponse<Array<PublicInterpreter>> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicInterpreter
    );
    yield put(storePublicInterpreters(response.data));
  } catch (error) {
    yield put(loadingPublicInterpretersFailed());
  }
}

export function* watchFetchPublicInterpreters() {
  yield takeLatest(loadPublicInterpreters, fetchPublicInterpreters);
}
