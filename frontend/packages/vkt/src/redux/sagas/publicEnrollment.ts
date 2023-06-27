import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicEnrollment,
  PublicReservationDetailsResponse,
  PublicReservationResponse,
} from 'interfaces/publicEnrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  initialisePublicEnrollment,
  loadPublicEnrollment,
  loadPublicEnrollmentSave,
  loadPublicExamEvent,
  rejectPublicEnrollmentInitialisation,
  rejectPublicEnrollmentSave,
  rejectPublicExamEvent,
  rejectPublicReservationRenew,
  renewPublicEnrollmentReservation,
  storePublicEnrollmentCancellation,
  storePublicEnrollmentSave,
  storePublicExamEvent,
  storeReservationDetails,
  updatePublicEnrollmentReservation,
} from 'redux/reducers/publicEnrollment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicEnrollmentSaga(action: PayloadAction<number>) {
  try {
    const eventId = action.payload;
    const loadUrl = `${APIEndpoints.PublicExamEvent}/${eventId}/enrollment`;

    const response: AxiosResponse<PublicReservationDetailsResponse> =
      yield call(axiosInstance.get, loadUrl);

    const { examEvent, person, reservation, enrollment } = response.data;

    yield put(
      storeReservationDetails({
        enrollment,
        examEvent: SerializationUtils.deserializePublicExamEvent(examEvent),
        person: SerializationUtils.deserializePerson(person),
        reservation:
          reservation && SerializationUtils.deserializeReservation(reservation),
      })
    );
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentInitialisation());
  }
}

function* loadPublicExamEventSaga(action: PayloadAction<number>) {
  try {
    const eventId = action.payload;
    const loadUrl = `${APIEndpoints.PublicExamEvent}/${eventId}`;

    const response: AxiosResponse<PublicExamEventResponse> = yield call(
      axiosInstance.get,
      loadUrl
    );

    const examEvent = SerializationUtils.deserializePublicExamEvent(
      response.data
    );

    yield put(storePublicExamEvent(examEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicExamEvent());
  }
}

function* initialisePublicEnrollmentSaga(
  action: PayloadAction<PublicExamEvent>
) {
  try {
    const initialisationUrl = action.payload.openings
      ? `${APIEndpoints.PublicExamEvent}/${action.payload.id}/reservation`
      : `${APIEndpoints.PublicExamEvent}/${action.payload.id}/queue`;

    const response: AxiosResponse<PublicReservationDetailsResponse> =
      yield call(axiosInstance.post, initialisationUrl, action.payload);

    const { examEvent, person, reservation, enrollment } = response.data;

    yield put(
      storeReservationDetails({
        enrollment,
        examEvent: SerializationUtils.deserializePublicExamEvent(examEvent),
        person: SerializationUtils.deserializePerson(person),
        reservation:
          reservation && SerializationUtils.deserializeReservation(reservation),
      })
    );
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
    examEventId: number;
    reservationId?: number;
  }>
) {
  const { examEventId, enrollment, reservationId } = action.payload;

  try {
    const {
      emailConfirmation: _unusedField1,
      privacyStatementConfirmation: _unusedField2,
      ...body
    } = enrollment;

    const saveUrl = reservationId
      ? `${APIEndpoints.PublicEnrollment}/reservation/${reservationId}`
      : `${APIEndpoints.PublicEnrollment}/queue?examEventId=${examEventId}`;

    const response: AxiosResponse<PublicEnrollment> = yield call(
      axiosInstance.post,
      saveUrl,
      body
    );
    yield put(storePublicEnrollmentSave(response.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

export function* watchPublicEnrollments() {
  yield takeLatest(loadPublicEnrollment, loadPublicEnrollmentSaga);
  yield takeLatest(loadPublicExamEvent, loadPublicExamEventSaga);
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
