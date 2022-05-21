import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import {
  loadingPublicInterpretersFailed,
  storeFetchedPublicInterpreters,
} from 'redux/reducers/publicInterpreter';

export function* storeResponse(interpreters: Array<PublicInterpreter>) {
  yield put(storeFetchedPublicInterpreters(interpreters));
}

export function* fetchPublicInterpreters() {
  try {
    const response: AxiosResponse<Array<PublicInterpreter>> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicInterpreter
    );

    yield call(storeResponse, response.data);
  } catch (error) {
    yield put(loadingPublicInterpretersFailed());
  }
}

export function* watchFetchPublicInterpreters() {
  yield takeLatest(
    'publicInterpreter/loadPublicInterpreters',
    fetchPublicInterpreters
  );
}
