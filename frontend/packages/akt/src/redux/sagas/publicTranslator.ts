import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicTranslatorResponse } from 'interfaces/publicTranslator';
import {
  PUBLIC_TRANSLATOR_ERROR,
  PUBLIC_TRANSLATOR_LOAD,
  PUBLIC_TRANSLATOR_LOADING,
  PUBLIC_TRANSLATOR_RECEIVED,
} from 'redux/actionTypes/publicTranslator';

export function* storeApiResults(apiResults: PublicTranslatorResponse) {
  const { translators, langs, towns } = apiResults;
  yield put({
    type: PUBLIC_TRANSLATOR_RECEIVED,
    translators,
    langs,
    towns,
  });
}

export function* fetchPublicTranslators() {
  try {
    yield put({ type: PUBLIC_TRANSLATOR_LOADING });
    // TODO Add runtime validation (io-ts) for API response?
    const apiResponse: AxiosResponse<PublicTranslatorResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicTranslator
    );

    yield call(storeApiResults, apiResponse.data);
  } catch (error) {
    yield put({ type: PUBLIC_TRANSLATOR_ERROR, error });
  }
}

export function* callFetchPublicTranslators() {
  yield call(fetchPublicTranslators);
}

export function* watchFetchPublicTranslators() {
  yield takeLatest(PUBLIC_TRANSLATOR_LOAD, fetchPublicTranslators);
}
