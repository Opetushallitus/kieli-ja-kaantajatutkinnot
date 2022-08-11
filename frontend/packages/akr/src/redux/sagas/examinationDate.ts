import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';
import { DateUtils } from 'shared/utils';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminationDateResponse } from 'interfaces/examinationDate';
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
import { showNotifierToast } from 'redux/reducers/notifier';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* insertExaminationDate(action: PayloadAction<Dayjs>) {
  try {
    yield call(axiosInstance.post, APIEndpoints.ExaminationDate, {
      date: DateUtils.serializeDate(action.payload),
    });
    yield put(addingExaminationDateSucceeded());
    yield put(loadExaminationDates());
  } catch (error) {
    yield put(rejectExaminationDateAdd());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* deleteExaminationDate(action: PayloadAction<number>) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.ExaminationDate}/${action.payload}`
    );
    yield put(removingExaminationDateSucceeded());
    yield put(loadExaminationDates());
  } catch (error) {
    yield put(rejectExaminationDateRemove());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* fetchExaminationDates() {
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
  yield takeLatest(loadExaminationDates, fetchExaminationDates);
  yield takeLatest(addExaminationDate.type, insertExaminationDate);
  yield takeLatest(removeExaminationDate.type, deleteExaminationDate);
}
