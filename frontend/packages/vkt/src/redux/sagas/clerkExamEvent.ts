import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkExamEventResponse } from 'interfaces/clerkExamEvent';
import {
  loadExamEvents,
  rejectExamEvents,
  storeExamEvents,
} from 'redux/reducers/clerkListExamEvent';
import { SerializationUtils } from 'utils/serialization';

function* loadExamEventsSaga() {
  try {
    const response: AxiosResponse<Array<ClerkExamEventResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExamEvent
    );
    const examEvents = response.data.map(
      SerializationUtils.deserializeClerkListExamEvent
    );
    yield put(storeExamEvents(examEvents));
  } catch (error) {
    yield put(rejectExamEvents());
  }
}

export function* watchExamEvents() {
  yield takeLatest(loadExamEvents, loadExamEventsSaga);
}
