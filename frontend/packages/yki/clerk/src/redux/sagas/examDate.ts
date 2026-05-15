import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { ExamDate, ExamDateResponse } from 'interfaces/examDate';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addEvaluation,
  addExamDate,
  deleteExamDate,
  loadExamDates,
  loadOrganizerExamDates,
  rejectAddEvaluation,
  rejectAddExamDate,
  rejectDeleteExamDate,
  rejectExamDates,
  rejectUpdateExamDate,
  storeAddEvaluation,
  storeAddExamDate,
  storeDeleteExamDate,
  storeExamDates,
  storeUpdateExamDate,
  updateExamDate,
} from 'redux/reducers/examDate';
import { NotifierUtils } from 'utils/notifier';

function* loadOrganizerExamDatesSaga(action: PayloadAction<string>) {
  const t = translateOutsideComponent();
  const oid = action.payload;
  try {
    const response: AxiosResponse<ExamDateResponse[]> = yield call(
      axiosInstance.get,
      `${APIEndpoints.Organizer}/${oid}/examDates`,
    );

    const examDates: ExamDate[] = response.data.map((ed) => ({
      id: ed.id,
      examDate: dayjs(ed.examDate),
      registrationStartDate: dayjs(ed.registrationStartDate),
      registrationEndDate: dayjs(ed.registrationEndDate),
      examType: ed.examType,
      languages: ed.languages,
      examSessionCount: ed.examSessionCount,
    }));

    yield put(storeExamDates(examDates));
  } catch (error) {
    yield put(rejectExamDates());
    yield put(setAPIError(t('yki.common.errors.loadingExamDatesFailed')));
  }
}

function* loadExamDatesSaga(action: PayloadAction<boolean>) {
  const t = translateOutsideComponent();
  const getFutureDates = action.payload;
  try {
    const response: AxiosResponse<ExamDateResponse[]> = yield call(
      axiosInstance.get,
      getFutureDates
        ? `${APIEndpoints.ClerkExamDate}`
        : `${APIEndpoints.ClerkExamDate}/all`,
    );

    const examDates: ExamDate[] = response.data.map((ed) => ({
      id: ed.id,
      examDate: dayjs(ed.examDate),
      registrationStartDate: dayjs(ed.registrationStartDate),
      registrationEndDate: dayjs(ed.registrationEndDate),
      examType: ed.examType,
      languages: ed.languages,
      examSessionCount: ed.examSessionCount,
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
    yield put(loadExamDates(false));
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
    yield put(loadExamDates(false));
  } catch (error) {
    yield put(rejectUpdateExamDate());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.updatingExamDateFailed'),
    );
    yield put(setAPIError(errorMessage));
  }
}

function* addEvaluationSaga(action: ReturnType<typeof addEvaluation>) {
  const t = translateOutsideComponent();
  try {
    const { examDateId, ...body } = action.payload;
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkExamDate}/${examDateId}/evaluation`,
      body,
    );
    yield put(storeAddEvaluation());
    yield put(loadExamDates(false));
  } catch (error) {
    yield put(rejectAddEvaluation());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.addingEvaluationFailed'),
    );
    yield put(setAPIError(errorMessage));
  }
}

function* deleteExamDateSaga(action: ReturnType<typeof deleteExamDate>) {
  const t = translateOutsideComponent();
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.ClerkExamDate}/${action.payload}`,
    );
    yield put(storeDeleteExamDate());
    yield put(loadExamDates(false));
  } catch (error) {
    yield put(rejectDeleteExamDate());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.deletingExamDateFailed'),
    );
    yield put(setAPIError(errorMessage));
  }
}

export function* watchExamDates() {
  yield takeLatest(loadOrganizerExamDates.type, loadOrganizerExamDatesSaga);
  yield takeLatest(loadExamDates.type, loadExamDatesSaga);
  yield takeLatest(addExamDate.type, addExamDateSaga);
  yield takeLatest(updateExamDate.type, updateExamDateSaga);
  yield takeLatest(addEvaluation.type, addEvaluationSaga);
  yield takeLatest(deleteExamDate.type, deleteExamDateSaga);
}
