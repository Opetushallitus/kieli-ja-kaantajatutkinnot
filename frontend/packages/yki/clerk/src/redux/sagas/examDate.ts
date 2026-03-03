import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { ExamDate, ExamDateResponse } from 'interfaces/examDate';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addExamDate,
  loadExamDates,
  rejectAddExamDate,
  rejectExamDates,
  storeAddExamDate,
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

function* addExamDateSaga(action: ReturnType<typeof addExamDate>) {
  const t = translateOutsideComponent();
  try {
    yield call(axiosInstance.post, APIEndpoints.ClerkExamDate, action.payload);
    yield put(storeAddExamDate());
    yield put(loadExamDates());
  } catch (error) {
    yield put(rejectAddExamDate());
    yield put(setAPIError(t('yki.common.errors.addingExamDateFailed')));
  }
}

export function* watchExamDates() {
  yield takeLatest(loadExamDates.type, loadExamDatesSaga);
  yield takeLatest(addExamDate.type, addExamDateSaga);
}
