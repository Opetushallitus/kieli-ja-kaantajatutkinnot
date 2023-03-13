import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  ExamSessionResponse,
  ExamSessionsResponse,
} from 'interfaces/examSessions';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadExamSession,
  rejectExamSession,
  storeExamSession,
} from 'redux/reducers/examSession';
import {
  loadExamSessions,
  rejectExamSessions,
  storeExamSessions,
} from 'redux/reducers/examSessions';
import { SerializationUtils } from 'utils/serialization';

function* loadExamSessionsSaga() {
  const t = translateOutsideComponent();
  try {
    // TODO Allow passing desired date through redux actions?
    const from = dayjs().format('YYYY-MM-DD');
    const response: AxiosResponse<ExamSessionsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ExamSessions,
      { params: { from } }
    );

    yield put(
      storeExamSessions(
        SerializationUtils.deserializeExamSessionsResponse(response.data)
      )
    );
  } catch (error) {
    yield put(rejectExamSessions());
    yield put(setAPIError(t('yki.common.error')));
  }
}

function* loadExamSessionSaga(action: PayloadAction<number>) {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<ExamSessionResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ExamSession.replace(/:examSessionId$/, `${action.payload}`)
    );

    yield put(
      storeExamSession(
        SerializationUtils.deserializeExamSessionResponse(response.data)
      )
    );
  } catch (error) {
    yield put(rejectExamSession());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchExamSessions() {
  yield takeLatest(loadExamSessions.type, loadExamSessionsSaga);
  yield takeLatest(loadExamSession.type, loadExamSessionSaga);
}
