import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { KoodistoResponse } from 'interfaces/code';
import {
  acceptNationalities,
  loadNationalities,
  rejectNationalities,
} from 'redux/reducers/nationalities';

function* loadNationalitiesSaga() {
  try {
    const response: AxiosResponse<KoodistoResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.CountryCodes,
    );
    yield put(acceptNationalities(response.data));
  } catch (error) {
    yield put(rejectNationalities());
  }
}

export function* watchNationalities() {
  yield takeLatest(loadNationalities.type, loadNationalitiesSaga);
}
