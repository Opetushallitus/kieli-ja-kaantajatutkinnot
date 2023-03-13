import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicEnrollment,
  PublicReservationDetails,
  PublicReservationDetailsResponse,
  PublicReservationResponse,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  increaseActiveStep,
  initialisePublicEnrollment,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentInitialisation,
  rejectPublicEnrollmentSave,
  rejectPublicReservationRenew,
  renewPublicEnrollmentReservation,
  storePublicEnrollmentCancellation,
  storePublicEnrollmentInitialisation,
  storePublicEnrollmentSave,
  updatePublicEnrollmentReservation,
} from 'redux/reducers/publicEnrollment';
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
    yield put(increaseActiveStep());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentInitialisation());
  }
}

function* renewPublicEnrollmentReservationSaga(action: PayloadAction<number>) {
  try {
    const renewUrl = `${APIEndpoints.PublicReservation}/${action.payload}/renew`;

    const response: AxiosResponse<PublicReservationResponse> = yield call(
      axiosInstance.put,
      renewUrl
    );

    const reservation = SerializationUtils.deserializeReservation(
      response.data
    );

    yield put(updatePublicEnrollmentReservation(reservation));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicReservationRenew());
  }
}

function* cancelPublicEnrollmentSaga() {
  yield put(storePublicEnrollmentCancellation());
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
    yield put(storePublicEnrollmentCancellation());
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
  yield takeLatest(
    renewPublicEnrollmentReservation,
    renewPublicEnrollmentReservationSaga
  );
  yield takeLatest(cancelPublicEnrollment, cancelPublicEnrollmentSaga);
  yield takeLatest(
    cancelPublicEnrollmentAndRemoveReservation,
    cancelPublicEnrollmentAndRemoveReservationSaga
  );
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
}
