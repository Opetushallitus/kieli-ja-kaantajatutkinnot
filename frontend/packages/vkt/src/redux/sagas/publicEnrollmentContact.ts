import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadPublicEnrollmentSave,
  loadPublicExamEvent,
  rejectPublicEnrollmentSave,
  rejectPublicExamEvent,
  storePublicEnrollmentSave,
  storePublicExamEvent,
} from 'redux/reducers/publicEnrollmentContact';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicExamEventSaga(action: PayloadAction<number>) {
  try {
    const examinerId = action.payload;
    const loadUrl = `${APIEndpoints.PublicEnrollmentAppointment}/${examinerId}`;

    const response: AxiosResponse<PublicExamEventResponse> = yield call(
      axiosInstance.get,
      loadUrl,
    );

    const enrollmentAppointment = SerializationUtils.deserializePublicExamEvent(
      response.data,
    );

    yield put(storePublicExamEvent(enrollmentAppointment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicExamEvent());
  }
}

function* loadPublicEnrollmentSaveSaga(
  action: PayloadAction<{
    enrollment: PublicEnrollmentContact;
    examinerId: number;
  }>,
) {
  const enrollment = action.payload.enrollment;
  const examinerId = action.payload.examinerId;

  try {
    const { id: _unused2, status: _unused5, ...body } = enrollment;

    const saveUrl = `${APIEndpoints.PublicEnrollmentContact}/${examinerId}`;

    yield call(axiosInstance.post, saveUrl, body);

    yield put(storePublicEnrollmentSave());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

export function* watchPublicEnrollmentContact() {
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
  yield takeLatest(loadPublicExamEvent, loadPublicExamEventSaga);
}
