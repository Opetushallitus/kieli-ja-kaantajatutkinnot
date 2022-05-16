import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicInterpreterResponse } from 'interfaces/publicInterpreter';
import {
  PUBLIC_INTERPRETER_ERROR,
  PUBLIC_INTERPRETER_LOAD,
  PUBLIC_INTERPRETER_LOADING,
  PUBLIC_INTERPRETER_RECEIVED,
} from 'redux/actionTypes/publicInterpreter';

export function* storeApiResults(apiResults: PublicInterpreterResponse) {
  const interpreters = apiResults;

  yield put({
    type: PUBLIC_INTERPRETER_RECEIVED,
    interpreters: interpreters,
  });
}

export function* fetchPublicInterpreters() {
  try {
    yield put({ type: PUBLIC_INTERPRETER_LOADING });
    // TODO Add runtime validation (io-ts) for API response?
    const apiResponse: AxiosResponse<PublicInterpreterResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicInterpreter
    );

    yield call(storeApiResults, apiResponse.data);
  } catch (error) {
    yield put({ type: PUBLIC_INTERPRETER_ERROR, error });
  }
}

export function* watchFetchPublicInterpreters() {
  yield takeLatest(PUBLIC_INTERPRETER_LOAD, fetchPublicInterpreters);
}
