import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkEnrollmentAppointmentResponse } from 'interfaces/clerkEnrollment';
import {
  loadClerkEnrollmentAppointment,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { SerializationUtils } from 'utils/serialization';

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
    loadClerkEnrollmentAppointment.type,
    loadClerkEnrollmentAppointmentSaga,
  );
}
