import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
  ClerkEnrollmentAppointmentResponse,
} from 'interfaces/clerkEnrollment';
import { ExaminerExamEventResponse } from 'interfaces/examinerExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadClerkEnrollmentAppointment,
  loadExaminerExamEvents,
  rejectClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointmentGrades,
  storeClerkEnrollmentAppointmentUpdate,
  storeExaminerExamEvents,
  updateClerkEnrollmentAppointment,
  upsertClerkEnrollmentAppointmentGrades,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* upsertClerkEnrollmentAppointmentGradesSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollmentAppointment;
    grades: ClerkEnrollmentAppointmentGrades;
  }>,
) {
  const { enrollment, grades } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentAppointmentGrades> =
      yield call(
        axiosInstance.put,
        `${APIEndpoints.ClerkEnrollmentAppointment}/${enrollment.id}/grades`,
        grades,
      );

    yield put(storeClerkEnrollmentAppointmentGrades(apiResponse.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    //yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

function* updateClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollmentAppointment;
    oid: string;
  }>,
) {
  const { enrollment, oid } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(
        axiosInstance.put,
        `${APIEndpoints.ExaminerEnrollmentAppointment.replace(':oid', oid)}/${
          enrollment.id
        }`,
        SerializationUtils.serializeClerkEnrollmentAppointment(enrollment),
      );
    const updatedEnrollment =
      SerializationUtils.deserializeClerkEnrollmentAppointment(
        apiResponse.data,
      );

    yield put(storeClerkEnrollmentAppointmentUpdate(updatedEnrollment));
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

function* loadExaminerExamEventsSaga(action: PayloadAction<string>) {
  try {
    const oid = action.payload;
    const loadUrl = APIEndpoints.ExaminerExamEvent.replace(':oid', oid);

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

export function* watchClerkEnrollmentAppointment() {
  yield takeLatest(
    updateClerkEnrollmentAppointment.type,
    updateClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(loadExaminerExamEvents.type, loadExaminerExamEventsSaga);
  yield takeLatest(
    loadClerkEnrollmentAppointment.type,
    loadClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(
    upsertClerkEnrollmentAppointmentGrades.type,
    upsertClerkEnrollmentAppointmentGradesSaga,
  );
}
