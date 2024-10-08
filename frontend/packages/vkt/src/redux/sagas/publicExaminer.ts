import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicExaminerResponse } from 'interfaces/publicExaminer';
import {
  loadPublicExaminers,
  rejectPublicExaminers,
  storePublicExaminers,
} from 'redux/reducers/publicExaminer';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicExaminersSaga() {
  try {
    const response: AxiosResponse<Array<PublicExaminerResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicExaminer,
    );
    const examiners = response.data.map(
      SerializationUtils.deserializePublicExaminer,
    );
    yield put(storePublicExaminers(examiners));
  } catch (error) {
    yield put(rejectPublicExaminers());
  }
}

export function* watchPublicExaminers() {
  yield takeLatest(loadPublicExaminers.type, loadPublicExaminersSaga);
}
