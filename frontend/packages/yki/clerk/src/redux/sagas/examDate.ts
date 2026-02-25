import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { ExamDate, ExamDateResponse } from 'interfaces/examDate';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadExamDates,
  rejectExamDates,
  storeExamDates,
} from 'redux/reducers/examDate';

function* loadExamDatesSaga() {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<ExamDateResponse[]> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExamDate,
    );

    const examDates: ExamDate[] = response.data.map((ed) => ({
      id: ed.id,
      examDate: dayjs(ed.examDate),
      languages: ed.languages,
    }));

    yield put(storeExamDates(examDates));
  } catch (error) {
    yield put(rejectExamDates());
    yield put(setAPIError(t('yki.common.errors.loadingExamDatesFailed')));
  }
}

export function* watchExamDates() {
  yield takeLatest(loadExamDates.type, loadExamDatesSaga);
}
