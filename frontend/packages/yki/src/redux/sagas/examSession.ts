import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { HTTPStatusCode } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { ExamSessionsResponse } from 'interfaces/examSessions';
import { setAPIError } from 'redux/reducers/APIError';
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

    if (response.status === HTTPStatusCode.Ok) {
      yield put(
        storeExamSessions(
          SerializationUtils.deserializeExamSessionsResponse(response.data)
        )
      );
    } else {
      yield put(rejectExamSessions());
      yield put(setAPIError(t('yki.common.error')));
    }
  } catch (error) {
    yield put(rejectExamSessions());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchExamSessions() {
  yield takeLatest(loadExamSessions.type, loadExamSessionsSaga);
}
