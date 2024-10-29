import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentResponse,
} from 'interfaces/clerkEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadClerkEnrollmentAppointment,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointmentUpdate,
  updateClerkEnrollmentAppointment,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* updateClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollmentAppointment;
  }>,
) {
  const { enrollment } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(
        axiosInstance.put,
        APIEndpoints.ClerkEnrollment,
        SerializationUtils.serializeClerkEnrollmentAppointment(enrollment),
      );
    const updatedEnrollment =
      SerializationUtils.deserializeClerkEnrollmentAppointment(
        apiResponse.data,
      );

    yield put(storeClerkEnrollmentAppointmentUpdate(updatedEnrollment));
    //yield put(storeClerkExamEventOverview(updatedExamEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    //yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

function* loadClerkEnrollmentAppointmentSaga(action: PayloadAction<number>) {
  try {
    const appointmentId = action.payload;
    const loadUrl = `${APIEndpoints.ClerkEnrollmentAppointment}/${appointmentId}`;

    const response: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(axiosInstance.get, loadUrl);
    const enrollment = SerializationUtils.deserializeClerkEnrollmentAppointment(
      response.data,
    );

    yield put(storeClerkEnrollmentAppointment(enrollment));
  } catch (error) {
    yield put(rejectClerkEnrollmentAppointment());
  }
}

export function* watchClerkEnrollmentAppointment() {
  yield takeLatest(
    updateClerkEnrollmentAppointment.type,
    updateClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(
    loadClerkEnrollmentAppointment.type,
    loadClerkEnrollmentAppointmentSaga,
  );
}
