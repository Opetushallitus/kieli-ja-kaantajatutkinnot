import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { KoodistoResponse } from 'interfaces/code';
import {
  acceptLanguages,
  loadLanguages,
  rejectLanguages,
} from 'redux/reducers/languages';

function* loadLanguagesSaga() {
  try {
    const response: AxiosResponse<KoodistoResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.LanguageCodes,
    );
    yield put(acceptLanguages(response.data));
  } catch (error) {
    yield put(rejectLanguages());
  }
}

export function* watchLanguages() {
  yield takeLatest(loadLanguages.type, loadLanguagesSaga);
}
