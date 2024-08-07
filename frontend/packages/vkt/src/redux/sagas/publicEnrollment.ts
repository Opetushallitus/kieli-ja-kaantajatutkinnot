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
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  loadEnrollmentInitialisation,
  loadPublicEnrollmentSave,
  loadPublicEnrollmentUpdate,
  loadPublicExamEvent,
  rejectEnrollmentInitialisation,
  rejectPublicEnrollmentSave,
  rejectPublicExamEvent,
  rejectReservationRenew,
  renewReservation,
  storeEnrollmentInitialisation,
  storePublicEnrollmentSave,
  storePublicExamEvent,
  storeReservationRenew,
} from 'redux/reducers/publicEnrollment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadEnrollmentInitialisationSaga(action: PayloadAction<number>) {
  try {
    const eventId = action.payload;
    const loadUrl = `${APIEndpoints.PublicExamEvent}/${eventId}/enrollment`;

    const response: AxiosResponse<PublicReservationDetailsResponse> =
      yield call(axiosInstance.get, loadUrl);

    const {
      person,
      enrollment,
      examEvent,
      reservation,
      freeEnrollmentDetails,
    } = response.data;

    yield put(
      storeEnrollmentInitialisation({
        person,
        examEvent: SerializationUtils.deserializePublicExamEvent(examEvent),
        reservation:
          reservation &&
          SerializationUtils.deserializePublicReservation(reservation),
        enrollment:
          enrollment &&
          SerializationUtils.deserializePublicEnrollment(enrollment),
        freeEnrollmentDetails,
      }),
    );
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectEnrollmentInitialisation());
  }
}

function* loadPublicExamEventSaga(action: PayloadAction<number>) {
  try {
    const eventId = action.payload;
    const loadUrl = `${APIEndpoints.PublicExamEvent}/${eventId}`;

    const response: AxiosResponse<PublicExamEventResponse> = yield call(
      axiosInstance.get,
      loadUrl,
    );

    const examEvent = SerializationUtils.deserializePublicExamEvent(
      response.data,
    );

    yield put(storePublicExamEvent(examEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicExamEvent());
  }
}

function* renewReservationSaga(action: PayloadAction<number>) {
  try {
    const renewUrl = `${APIEndpoints.PublicReservation}/${action.payload}/renew`;

    const response: AxiosResponse<PublicReservationResponse> = yield call(
      axiosInstance.put,
      renewUrl,
    );

    const reservation = SerializationUtils.deserializePublicReservation(
      response.data,
    );

    yield put(storeReservationRenew(reservation));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectReservationRenew());
  }
}

function* cancelPublicEnrollmentAndRemoveReservationSaga(
  action: PayloadAction<number>,
) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.PublicReservation}/${action.payload}`,
    );
  } catch (error) {
    // If deletion of reservation fails, it will expire in 30 mins
  } finally {
    yield put(cancelPublicEnrollment());
  }
}

function* loadPublicEnrollmentUpdateSaga(
  action: PayloadAction<{
    enrollment: PublicEnrollment;
    examEventId: number;
  }>,
) {
  const { enrollment, examEventId } = action.payload;

  try {
    const {
      emailConfirmation: _unused1,
      id: _unused2,
      hasPreviousEnrollment: _unused3,
      privacyStatementConfirmation: _unused4,
      status: _unused5,
      examEventId: _unused6,
      ...body
    } = enrollment;

    const updateUrl = `${APIEndpoints.PublicEnrollment}/update?examEventId=${examEventId}`;

    const response: AxiosResponse<PublicEnrollment> = yield call(
      axiosInstance.post,
      updateUrl,
      body,
    );
    yield put(storePublicEnrollmentSave(response.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

function* loadPublicEnrollmentSaveSaga(
  action: PayloadAction<{
    enrollment: PublicEnrollment;
    examEventId: number;
    reservationId?: number;
  }>,
) {
  const { enrollment, examEventId, reservationId } = action.payload;

  try {
    const {
      emailConfirmation: _unused1,
      id: _unused2,
      hasPreviousEnrollment: _unused3,
      privacyStatementConfirmation: _unused4,
      status: _unused5,
      examEventId: _unused6,
      ...body
    } = enrollment;

    const saveUrl = reservationId
      ? `${APIEndpoints.PublicEnrollment}/reservation/${reservationId}`
      : `${APIEndpoints.PublicEnrollment}/queue?examEventId=${examEventId}`;

    const response: AxiosResponse<PublicEnrollment> = yield call(
      axiosInstance.post,
      saveUrl,
      body,
    );
    yield put(storePublicEnrollmentSave(response.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentSave());
  }
}

export function* watchPublicEnrollments() {
  yield takeLatest(
    loadEnrollmentInitialisation,
    loadEnrollmentInitialisationSaga,
  );
  yield takeLatest(loadPublicExamEvent, loadPublicExamEventSaga);
  yield takeLatest(renewReservation, renewReservationSaga);
  yield takeLatest(
    cancelPublicEnrollmentAndRemoveReservation,
    cancelPublicEnrollmentAndRemoveReservationSaga,
  );
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
  yield takeLatest(loadPublicEnrollmentUpdate, loadPublicEnrollmentUpdateSaga);
}
