import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerExamEventResponse } from 'interfaces/examinerExamEvent';
import {
  loadExaminerExamEventOverview,
  rejectExaminerExamEventOverview,
  storeExaminerExamEventOverview,
} from 'redux/reducers/examinerExamEventOverview';
import { SerializationUtils } from 'utils/serialization';

function* loadExaminerExamEventOverviewSaga(
  action: PayloadAction<{
    oid: string;
    examEventId: number;
  }>,
) {
  try {
    const { oid, examEventId } = action.payload;
    const apiResponse: AxiosResponse<ExaminerExamEventResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ExaminerExamEvent.replace(/:oid/, oid)}/${examEventId}`,
    );

    const examEvent = SerializationUtils.deserializeExaminerExamEvent(
      apiResponse.data,
    );
    yield put(storeExaminerExamEventOverview(examEvent));
  } catch (error) {
    yield put(rejectExaminerExamEventOverview());
  }
}

export function* watchExaminerExamEventOverview() {
  yield takeLatest(
    loadExaminerExamEventOverview.type,
    loadExaminerExamEventOverviewSaga,
  );
}
