import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicUIViews } from 'enums/app';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { setPublicUIView } from 'redux/reducers/publicUIView';

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

export function* watchPublicEnrollments() {
  yield takeLatest(cancelPublicEnrollment, cancelPublicEnrollmentSaga);
  yield takeLatest(
    cancelPublicEnrollmentAndRemoveReservation,
    cancelPublicEnrollmentAndRemoveReservationSaga
  );
}
