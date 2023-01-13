import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollmentResponse,
  ClerkEnrollmentStatusChange,
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import { storeClerkEnrollmentDetails } from 'redux/reducers/clerkEnrollmentDetails';
import {
  changeClerkEnrollmentStatus,
  changingClerkEnrollmentStatusSucceeded,
  loadClerkExamEventOverview,
  rejectClerkEnrollmentStatusChange,
  rejectClerkExamEventDetailsUpdate,
  rejectClerkExamEventOverview,
  storeClerkExamEventOverview,
  updateClerkExamEventDetails,
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

function* changeClerkEnrollmentStatusSaga(
  action: PayloadAction<{
    statusChange: ClerkEnrollmentStatusChange;
    examEvent: ClerkExamEvent;
  }>
) {
  const { statusChange, examEvent } = action.payload;
  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkEnrollment}/status`,
      statusChange
    );

    const updatedEnrollment = SerializationUtils.deserializeClerkEnrollment(
      apiResponse.data
    );

    const updatedEnrollments = [...examEvent.enrollments];
    const idx = updatedEnrollments.findIndex(
      (e) => e.id === updatedEnrollment.id
    );
    updatedEnrollments[idx] = updatedEnrollment;

    const updatedExamEvent = {
      ...examEvent,
      enrollments: updatedEnrollments,
    };

    yield put(changingClerkEnrollmentStatusSucceeded());
    yield put(storeClerkExamEventOverview(updatedExamEvent));
    yield put(upsertExamEvents(updatedExamEvent));
    yield put(storeClerkEnrollmentDetails(updatedEnrollment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentStatusChange());
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
    changeClerkEnrollmentStatus.type,
    changeClerkEnrollmentStatusSaga
  );
}
