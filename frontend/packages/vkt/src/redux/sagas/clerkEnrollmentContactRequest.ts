import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkEnrollmentContactResponse } from 'interfaces/clerkEnrollment';
import { ExaminerExamEventResponse } from 'interfaces/examinerExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  createClerkEnrollmentAppointment,
  deleteClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  loadExaminerExamEvents,
  rejectClerkEnrollmentContactRequest,
  rejectCreateClerkEnrollmentAppointment,
  storeClerkEnrollmentContactRequest,
  storeCreateClerkEnrollmentAppointment,
  storeDeleteClerkEnrollmentContactRequest,
  storeExaminerExamEvents,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* createClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
    examEvent: number;
  }>,
) {
  try {
    const { id, oid, examEvent } = action.payload;
    const saveUrl = `${APIEndpoints.ExaminerEnrollmentContactRequest.replace(
      /:oid/,
      oid,
    )}/${id}/convertToAppointment`;

    const response: AxiosResponse<ClerkEnrollmentContactResponse> = yield call(
      axiosInstance.post,
      saveUrl,
      { id: examEvent },
    );
    const enrollment =
      SerializationUtils.deserializeClerkEnrollmentContactRequest(
        response.data,
      );

    yield put(storeCreateClerkEnrollmentAppointment(enrollment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
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
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentContactRequest());
  }
}

function* loadExaminerExamEventsSaga(action: PayloadAction<string>) {
  try {
    const oid = action.payload;
    const loadUrl = APIEndpoints.ExaminerExamEvent.replace(/:oid/, oid);

    const response: AxiosResponse<Array<ExaminerExamEventResponse>> =
      yield call(axiosInstance.get, loadUrl);
    const examinerExamEvents = SerializationUtils.deserializeExaminerExamEvents(
      response.data,
    );

    yield put(storeExaminerExamEvents(examinerExamEvents));
  } catch (error) {
    //yield put(rejectClerkEnrollmentAppointment());
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
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentContactRequest());
  }
}

export function* watchClerkEnrollmentContactRequest() {
  yield takeLatest(
    loadClerkEnrollmentContactRequest.type,
    loadClerkEnrollmentContactRequestSaga,
  );
  yield takeLatest(loadExaminerExamEvents.type, loadExaminerExamEventsSaga);
  yield takeLatest(
    deleteClerkEnrollmentContactRequest.type,
    deleteClerkEnrollmentContactRequestSaga,
  );
  yield takeLatest(
    createClerkEnrollmentAppointment.type,
    createClerkEnrollmentAppointmentSaga,
  );
}
