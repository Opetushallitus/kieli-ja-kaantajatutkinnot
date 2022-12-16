import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicTranslatorResponse } from 'interfaces/publicTranslator';
import {
  loadPublicTranslators,
  rejectPublicTranslators,
  storePublicTranslators,
} from 'redux/reducers/publicTranslator';

function* loadPublicTranslatorsSaga() {
  try {
    const apiResponse: AxiosResponse<PublicTranslatorResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicTranslator
    );

    yield put(storePublicTranslators(apiResponse.data));
  } catch (error) {
    yield put(rejectPublicTranslators());
  }
}

export function* watchPublicTranslators() {
  yield takeLatest(loadPublicTranslators.type, loadPublicTranslatorsSaga);
}
