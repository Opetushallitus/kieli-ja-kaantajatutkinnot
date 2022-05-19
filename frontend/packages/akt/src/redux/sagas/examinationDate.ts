import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { DateUtils } from 'shared/utils';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ExaminationDateResponse,
  ExaminationDates,
} from 'interfaces/examinationDate';
import {
  AddExaminationDateActionType,
  EXAMINATION_DATE_ADD,
  EXAMINATION_DATE_ADD_ERROR,
  EXAMINATION_DATE_ADD_SUCCESS,
  EXAMINATION_DATE_ERROR,
  EXAMINATION_DATE_LOAD,
  EXAMINATION_DATE_LOADING,
  EXAMINATION_DATE_RECEIVED,
  EXAMINATION_DATE_REMOVE,
  EXAMINATION_DATE_REMOVE_ERROR,
  EXAMINATION_DATE_REMOVE_SUCCESS,
  RemoveExaminationDateActionType,
} from 'redux/actionTypes/examinationDate';
import { NOTIFIER_TOAST_ADD } from 'redux/actionTypes/notifier';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* addExaminationDate(action: AddExaminationDateActionType) {
  try {
    yield call(axiosInstance.post, APIEndpoints.ExaminationDate, {
      date: DateUtils.serializeDate(action.date),
    });
    yield put({ type: EXAMINATION_DATE_ADD_SUCCESS });
    yield put({ type: EXAMINATION_DATE_LOAD });
  } catch (error) {
    yield put({ type: EXAMINATION_DATE_ADD_ERROR });
    yield put({
      type: NOTIFIER_TOAST_ADD,
      notifier: NotifierUtils.createAxiosErrorNotifierToast(
        error as AxiosError
      ),
    });
  }
}

function* removeExaminationDate(action: RemoveExaminationDateActionType) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.ExaminationDate}/${action.examinationDateId}`
    );
    yield put({ type: EXAMINATION_DATE_REMOVE_SUCCESS });
    yield put({ type: EXAMINATION_DATE_LOAD });
  } catch (error) {
    yield put({ type: EXAMINATION_DATE_REMOVE_ERROR });
    yield put({
      type: NOTIFIER_TOAST_ADD,
      notifier: NotifierUtils.createAxiosErrorNotifierToast(
        error as AxiosError
      ),
    });
  }
}

function* fetchExaminationDates() {
  try {
    yield put({ type: EXAMINATION_DATE_LOADING });
    const apiResponse: AxiosResponse<Array<ExaminationDateResponse>> =
      yield call(axiosInstance.get, APIEndpoints.ExaminationDate);

    const deserializedResponse = SerializationUtils.deserializeExaminationDates(
      apiResponse.data
    );
    yield call(storeApiResults, deserializedResponse);
  } catch (error) {
    yield put({ type: EXAMINATION_DATE_ERROR, error });
  }
}

export function* storeApiResults(response: ExaminationDates) {
  const { dates } = response;

  yield put({
    type: EXAMINATION_DATE_RECEIVED,
    dates,
  });
}

export function* watchExaminationDates() {
  yield takeLatest(EXAMINATION_DATE_LOAD, fetchExaminationDates);
  yield takeLatest(EXAMINATION_DATE_ADD, addExaminationDate);
  yield takeLatest(EXAMINATION_DATE_REMOVE, removeExaminationDate);
}
