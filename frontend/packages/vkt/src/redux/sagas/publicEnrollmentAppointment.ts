import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicEnrollmentAppointment,
  PublicEnrollmentAppointmentResponse,
} from 'interfaces/publicEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadPublicEnrollmentAppointment,
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentAppointment,
  storePublicEnrollmentAppointment,
  storePublicEnrollmentAppointmentSave,
} from 'redux/reducers/publicEnrollmentAppointment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadPublicEnrollmentAppointmentSaga(action: PayloadAction<number>) {
  try {
    const enrollmentId = action.payload;
    const loadUrl = `${APIEndpoints.PublicEnrollmentAppointment}/${enrollmentId}`;

    const response: AxiosResponse<PublicEnrollmentAppointmentResponse> =
      yield call(axiosInstance.get, loadUrl);

    const enrollmentAppointment =
      SerializationUtils.deserializePublicEnrollmentAppointment(response.data);

    yield put(storePublicEnrollmentAppointment(enrollmentAppointment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentAppointment());
  }
}

function* loadPublicEnrollmentSaveSaga(
  action: PayloadAction<PublicEnrollmentAppointment>,
) {
  const enrollment = action.payload;

  try {
    const body = {
      id: enrollment.id,
      phoneNumber: enrollment.phoneNumber,
      digitalCertificateConsent: enrollment.digitalCertificateConsent,
      street: enrollment.street,
      town: enrollment.town,
      postalCode: enrollment.postalCode,
      country: enrollment.country,
    };

    const saveUrl = `${APIEndpoints.PublicEnrollmentAppointment}/${enrollment.id}`;
    const response: AxiosResponse<PublicEnrollmentAppointmentResponse> =
      yield call(axiosInstance.post, saveUrl, body);

    const enrollmentAppointment =
      SerializationUtils.deserializePublicEnrollmentAppointment(response.data);

    yield put(storePublicEnrollmentAppointmentSave(enrollmentAppointment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectPublicEnrollmentAppointment());
  }
}

export function* watchPublicEnrollmentAppointments() {
  yield takeLatest(loadPublicEnrollmentSave, loadPublicEnrollmentSaveSaga);
  yield takeLatest(
    loadPublicEnrollmentAppointment,
    loadPublicEnrollmentAppointmentSaga,
  );
}
