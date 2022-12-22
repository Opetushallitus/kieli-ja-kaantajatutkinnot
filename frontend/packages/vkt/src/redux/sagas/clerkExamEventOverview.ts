import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { EnrollmentStatus } from 'enums/app';
import {
  ClerkEnrollmentResponse,
  ClerkEnrollmentStatusUpdate,
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadClerkExamEventOverview,
  rejectClerkEnrollmentStatusUpdate,
  rejectClerkExamEventDetailsUpdate,
  rejectClerkExamEventOverview,
  storeClerkExamEventOverview,
  updateClerkEnrollmentStatus,
  updateClerkExamEventDetails,
  updatingClerkEnrollmentStatusSucceeded,
  updatingClerkExamEventDetailsSucceeded,
} from 'redux/reducers/clerkExamEventOverview';
import { upsertExamEvents } from 'redux/reducers/clerkListExamEvent';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkExamEventOverviewSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkExamEvent}/${action.payload}`
    );

    const examEvent = SerializationUtils.deserializeClerkExamEvent(
      apiResponse.data
    );
    yield put(storeClerkExamEventOverview(examEvent));
  } catch (error) {
    yield put(rejectClerkExamEventOverview());
  }
}

function* updateClerkExamEventDetailsSaga(
  action: PayloadAction<ClerkExamEvent>
) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkExamEvent,
      SerializationUtils.serializeClerkExamEvent(action.payload)
    );
    const examEvent = SerializationUtils.deserializeClerkExamEvent(
      apiResponse.data
    );
    yield put(upsertExamEvents(examEvent));
    yield put(updatingClerkExamEventDetailsSucceeded(examEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkExamEventDetailsUpdate());
  }
}

function* updateClerkEnrollmentStatusSaga(
  action: PayloadAction<{
    statusUpdate: ClerkEnrollmentStatusUpdate;
    examEvent: ClerkExamEvent;
  }>
) {
  const { statusUpdate, examEvent } = action.payload;
  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkEnrollment}/status`,
      statusUpdate
    );
    const enrollment = apiResponse.data;

    const updatedEnrollment = SerializationUtils.deserializeClerkEnrollment(
      apiResponse.data
    );

    const updatedEnrollments = [...examEvent.enrollments];
    const idx = updatedEnrollments.findIndex((e) => e.id === enrollment.id);
    updatedEnrollments[idx] = updatedEnrollment;

    const updatedParticipants = updatedEnrollments.filter((enrollment) =>
      [EnrollmentStatus.PAID, EnrollmentStatus.EXPECTING_PAYMENT].includes(
        enrollment.status
      )
    ).length;

    const updatedExamEvent = {
      ...examEvent,
      participants: updatedParticipants,
      enrollments: updatedEnrollments,
    };

    yield put(updatingClerkEnrollmentStatusSucceeded());
    yield put(storeClerkExamEventOverview(updatedExamEvent));
    yield put(upsertExamEvents(updatedExamEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentStatusUpdate());
  }
}

export function* watchClerkExamEventOverview() {
  yield takeLatest(
    loadClerkExamEventOverview.type,
    loadClerkExamEventOverviewSaga
  );
  yield takeLatest(
    updateClerkExamEventDetails.type,
    updateClerkExamEventDetailsSaga
  );
  yield takeLatest(
    updateClerkEnrollmentStatus.type,
    updateClerkEnrollmentStatusSaga
  );
}
