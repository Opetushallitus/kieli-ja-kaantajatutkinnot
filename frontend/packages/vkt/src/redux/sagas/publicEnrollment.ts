import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicUIViews } from 'enums/app';
import {
  PublicEnrollment,
  PublicReservation,
  PublicReservationDetails,
  PublicReservationDetailsResponse,
  PublicReservationResponse,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  initialisePublicEnrollment,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentInitialisation,
  rejectPublicEnrollmentSave,
  resetPublicEnrollment,
  storePublicEnrollmentInitialisation,
  storePublicEnrollmentSave,
  updatePublicEnrollmentReservation,
} from 'redux/reducers/publicEnrollment';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* initialisePublicEnrollmentSaga(
  action: PayloadAction<PublicExamEvent>
) {
  try {
    const initialisationUrl = action.payload.openings
      ? `${APIEndpoints.PublicExamEvent}/${action.payload.id}/reservation`
      : `${APIEndpoints.PublicExamEvent}/${action.payload.id}/queue`;

    const response: AxiosResponse<PublicReservationDetailsResponse> =
      yield call(axiosInstance.post, initialisationUrl, action.payload);

    const reservationDetails =
      SerializationUtils.deserializePublicReservationDetails(response.data);

    yield put(storePublicEnrollmentInitialisation(reservationDetails));
    yield put(setPublicUIView(PublicUIViews.Enrollment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentInitialisation());
  }
}

function* renewPublicEnrollmentReservationSaga(
  action: PayloadAction<PublicExamEvent>
) {
  try {
    const renewUrl = `${APIEndpoints.PublicExamEvent}/${action.payload.id}/reservation/renew`;

    const response: AxiosResponse<PublicReservationResponse> = yield call(
      axiosInstance.post,
      renewUrl,
      action.payload
    );

    const reservation = SerializationUtils.deserializeReservation(
      response.data
    );

    yield put(updatePublicEnrollmentReservation(reservation));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentInitialisation());
  }
}

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
  action: PayloadAction<{
    enrollment: PublicEnrollment;
    reservationDetails: PublicReservationDetails;
  }>
) {
  const { enrollment, reservationDetails } = action.payload;

  try {
    const {
      emailConfirmation: _unusedField1,
      privacyStatementConfirmation: _unusedField2,
      ...body
    } = enrollment;

    const saveUrl = reservationDetails.reservation
      ? `${APIEndpoints.PublicEnrollment}/reservation/${reservationDetails.reservation.id}`
      : `${APIEndpoints.PublicEnrollment}/queue?examEventId=${reservationDetails.examEvent.id}&personId=${reservationDetails.person.id}`;

    yield call(axiosInstance.post, saveUrl, body);

    yield put(storePublicEnrollmentSave());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

export function* watchPublicEnrollments() {
  yield takeLatest(initialisePublicEnrollment, initialisePublicEnrollmentSaga);
  yield takeLatest(cancelPublicEnrollment, cancelPublicEnrollmentSaga);
  yield takeLatest(
    cancelPublicEnrollmentAndRemoveReservation,
    cancelPublicEnrollmentAndRemoveReservationSaga
  );
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
}
