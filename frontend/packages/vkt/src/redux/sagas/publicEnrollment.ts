import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicUIViews } from 'enums/app';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  resetPublicEnrollment,
  storePublicEnrollmentSave,
} from 'redux/reducers/publicEnrollment';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { NotifierUtils } from 'utils/notifier';

function* cancelPublicEnrollmentSaga() {
  yield put(setPublicUIView(PublicUIViews.ExamEventListing));
  yield put(resetPublicEnrollment());
}

function* cancelPublicEnrollmentAndRemoveReservationSaga(
  action: PayloadAction<number>
) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.PublicReservation}/${action.payload}`
    );
  } catch (error) {
    // If deletion of reservation fails, it will expire in 30 mins
  } finally {
    yield put(setPublicUIView(PublicUIViews.ExamEventListing));
    yield put(resetPublicEnrollment());
  }
}

function* loadPublicEnrollmentSaveSaga(
  action: PayloadAction<PublicEnrollment>
) {
  try {
    const {
      emailConfirmation: _unusedField1,
      privacyStatementConfirmation: _unusedField2,
      reservationId,
      ...body
    } = action.payload;

    if (!reservationId) {
      return;
    }

    yield call(
      axiosInstance.post,
      `${APIEndpoints.PublicReservation}/${reservationId}/enrollment`,
      body
    );
    yield put(setPublicUIView(PublicUIViews.EnrollmentComplete));
    yield put(storePublicEnrollmentSave());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

export function* watchPublicEnrollments() {
  yield takeLatest(cancelPublicEnrollment, cancelPublicEnrollmentSaga);
  yield takeLatest(
    cancelPublicEnrollmentAndRemoveReservation,
    cancelPublicEnrollmentAndRemoveReservationSaga
  );
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
}
