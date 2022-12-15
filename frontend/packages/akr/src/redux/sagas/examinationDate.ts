import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';
import { DateUtils } from 'shared/utils';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ExaminationDate,
  ExaminationDateResponse,
} from 'interfaces/examinationDate';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addExaminationDate,
  addingExaminationDateSucceeded,
  loadExaminationDates,
  rejectExaminationDateAdd,
  rejectExaminationDateRemove,
  rejectExaminationDates,
  removeExaminationDate,
  removingExaminationDateSucceeded,
  storeExaminationDates,
} from 'redux/reducers/examinationDate';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* addExaminationDateSaga(action: PayloadAction<Dayjs>) {
  try {
    yield call(axiosInstance.post, APIEndpoints.ExaminationDate, {
      date: DateUtils.serializeDate(action.payload),
    });
    yield put(addingExaminationDateSucceeded());
    yield put(loadExaminationDates());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectExaminationDateAdd());
  }
}

function* removeExaminationDateSaga(action: PayloadAction<ExaminationDate>) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.ExaminationDate}/${action.payload.id}`
    );
    yield put(removingExaminationDateSucceeded());
    yield put(loadExaminationDates());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectExaminationDateRemove());
  }
}

function* loadExaminationDatesSaga() {
  try {
    const apiResponse: AxiosResponse<Array<ExaminationDateResponse>> =
      yield call(axiosInstance.get, APIEndpoints.ExaminationDate);

    const deserializedResponse = SerializationUtils.deserializeExaminationDates(
      apiResponse.data
    );
    yield put(storeExaminationDates(deserializedResponse.dates));
  } catch (error) {
    yield put(rejectExaminationDates());
  }
}

export function* watchExaminationDates() {
  yield takeLatest(loadExaminationDates.type, loadExaminationDatesSaga);
  yield takeLatest(addExaminationDate.type, addExaminationDateSaga);
  yield takeLatest(removeExaminationDate.type, removeExaminationDateSaga);
}
