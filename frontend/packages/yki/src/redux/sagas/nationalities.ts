import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { NationalitiesResponse } from 'interfaces/nationality';
import {
  acceptNationalities,
  loadNationalities,
  rejectNationalities,
} from 'redux/reducers/nationalities';

function* loadNationalitiesSaga() {
  try {
    const response: AxiosResponse<NationalitiesResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.CountryCodes
    );
    const { data } = response;
    yield put(acceptNationalities(data));
  } catch (error) {
    yield put(rejectNationalities());
  }
}

export function* watchNationalities() {
  yield takeLatest(loadNationalities.type, loadNationalitiesSaga);
}
