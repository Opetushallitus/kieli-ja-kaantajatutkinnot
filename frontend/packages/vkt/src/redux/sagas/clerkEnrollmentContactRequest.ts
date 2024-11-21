import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkEnrollmentContactResponse } from 'interfaces/clerkEnrollment';
import {
  createClerkEnrollmentAppointment,
  deleteClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  rejectClerkEnrollmentContactRequest,
  rejectCreateClerkEnrollmentAppointment,
  storeClerkEnrollmentContactRequest,
  storeCreateClerkEnrollmentAppointment,
  storeDeleteClerkEnrollmentContactRequest,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { SerializationUtils } from 'utils/serialization';

function* createClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
  }>,
) {
  try {
    const { id, oid } = action.payload;
    const saveUrl = `${APIEndpoints.ExaminerEnrollmentContactRequest.replace(
      /:oid/,
      oid,
    )}/${id}/convertToAppointment`;

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

function* deleteClerkEnrollmentContactRequestSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
  }>,
) {
  try {
    const { id, oid } = action.payload;
    const deleteUrl = `${APIEndpoints.ExaminerEnrollmentContactRequest.replace(
      /:oid/,
      oid,
    )}/${id}`;

    yield call(axiosInstance.delete, deleteUrl);

    yield put(storeDeleteClerkEnrollmentContactRequest());
  } catch (error) {
    yield put(rejectClerkEnrollmentContactRequest());
  }
}

function* loadClerkEnrollmentContactRequestSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
  }>,
) {
  try {
    const { id, oid } = action.payload;
    const loadUrl = `${APIEndpoints.ExaminerEnrollmentContactRequest.replace(
      /:oid/,
      oid,
    )}/${id}`;

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
    deleteClerkEnrollmentContactRequest.type,
    deleteClerkEnrollmentContactRequestSaga,
  );
  yield takeLatest(
    createClerkEnrollmentAppointment.type,
    createClerkEnrollmentAppointmentSaga,
  );
}
