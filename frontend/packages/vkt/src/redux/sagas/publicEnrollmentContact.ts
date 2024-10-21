import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExaminerResponse } from 'interfaces/publicExaminer';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadPublicEnrollmentSave,
  loadPublicExaminer,
  rejectPublicEnrollmentSave,
  rejectPublicExaminer,
  storePublicEnrollmentSave,
  storePublicExaminer,
} from 'redux/reducers/publicEnrollmentContact';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicExaminerSaga(action: PayloadAction<number>) {
  try {
    const examinerId = action.payload;
    const loadUrl = `${APIEndpoints.PublicEnrollmentContact}/${examinerId}`;

    const response: AxiosResponse<PublicExaminerResponse> = yield call(
      axiosInstance.get,
      loadUrl,
    );

    const examiner = SerializationUtils.deserializePublicExaminer(
      response.data,
    );

    yield put(storePublicExaminer(examiner));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicExaminer());
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
  yield takeLatest(loadPublicExaminer, loadPublicExaminerSaga);
}
