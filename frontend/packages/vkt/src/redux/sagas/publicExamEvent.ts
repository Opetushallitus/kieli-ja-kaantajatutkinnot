import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import {
  loadPublicExamEvents,
  rejectPublicExamEvents,
  storePublicExamEvents,
} from 'redux/reducers/publicExamEvent';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicExamEventsSaga() {
  try {
    const response: AxiosResponse<Array<PublicExamEventResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicExamEvent,
    );
    const examEvents = response.data.map(
      SerializationUtils.deserializePublicExamEvent,
    );
    yield put(storePublicExamEvents(examEvents));
  } catch (error) {
    yield put(rejectPublicExamEvents());
  }
}

export function* watchPublicExamEvents() {
  yield takeLatest(loadPublicExamEvents.type, loadPublicExamEventsSaga);
}
