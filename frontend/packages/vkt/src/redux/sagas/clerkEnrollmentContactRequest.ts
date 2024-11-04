import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkEnrollmentContactResponse } from 'interfaces/clerkEnrollment';
import {
  createClerkEnrollmentAppointment,
  loadClerkEnrollmentContactRequest,
  rejectClerkEnrollmentContactRequest,
  rejectCreateClerkEnrollmentAppointment,
  storeClerkEnrollmentContactRequest,
  storeCreateClerkEnrollmentAppointment,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { SerializationUtils } from 'utils/serialization';

function* createClerkEnrollmentAppointmentSaga(action: PayloadAction<number>) {
  try {
    const contactId = action.payload;
    const saveUrl = `${APIEndpoints.ClerkEnrollmentContactRequest}/${contactId}/convertToAppointment`;

    const response: AxiosResponse<ClerkEnrollmentContactResponse> = yield call(
      axiosInstance.post,
      saveUrl,
    );
    const enrollment =
      SerializationUtils.deserializeClerkEnrollmentContactRequest(
        response.data,
      );

    yield put(storeCreateClerkEnrollmentAppointment(enrollment));
  } catch (error) {
    yield put(rejectCreateClerkEnrollmentAppointment());
  }
}

function* loadClerkEnrollmentContactRequestSaga(action: PayloadAction<number>) {
  try {
    const contactId = action.payload;
    const loadUrl = `${APIEndpoints.ClerkEnrollmentContactRequest}/${contactId}`;

    const response: AxiosResponse<ClerkEnrollmentContactResponse> = yield call(
      axiosInstance.get,
      loadUrl,
    );
    const enrollment =
      SerializationUtils.deserializeClerkEnrollmentContactRequest(
        response.data,
      );

    yield put(storeClerkEnrollmentContactRequest(enrollment));
  } catch (error) {
    yield put(rejectClerkEnrollmentContactRequest());
  }
}

export function* watchClerkEnrollmentContactRequest() {
  yield takeLatest(
    loadClerkEnrollmentContactRequest.type,
    loadClerkEnrollmentContactRequestSaga,
  );
  yield takeLatest(
    createClerkEnrollmentAppointment.type,
    createClerkEnrollmentAppointmentSaga,
  );
}
