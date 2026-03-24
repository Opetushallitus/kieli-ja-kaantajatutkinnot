import { AxiosError, AxiosResponse } from 'axios';
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
  rejectUpdateExamDate,
  storeAddExamDate,
  storeExamDates,
  storeUpdateExamDate,
  updateExamDate,
} from 'redux/reducers/examDate';
import { NotifierUtils } from 'utils/notifier';

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
      registrationStartDate: dayjs(ed.registrationStartDate),
      registrationEndDate: dayjs(ed.registrationEndDate),
      examType: ed.examType,
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

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.addingExamDateFailed'),
    );
    yield put(setAPIError(errorMessage));
  }
}

function* updateExamDateSaga(action: ReturnType<typeof updateExamDate>) {
  const t = translateOutsideComponent();
  try {
    yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkExamDate}/${action.payload.id}`,
      action.payload,
    );
    yield put(storeUpdateExamDate());
    yield put(loadExamDates());
  } catch (error) {
    yield put(rejectUpdateExamDate());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.updatingExamDateFailed'),
    );
    yield put(setAPIError(errorMessage));
  }
}

export function* watchExamDates() {
  yield takeLatest(loadExamDates.type, loadExamDatesSaga);
  yield takeLatest(addExamDate.type, addExamDateSaga);
  yield takeLatest(updateExamDate.type, updateExamDateSaga);
}
