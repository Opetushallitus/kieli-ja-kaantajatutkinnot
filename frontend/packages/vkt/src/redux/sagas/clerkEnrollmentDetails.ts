import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollment,
  ClerkEnrollmentResponse,
  ClerkExamEvent,
} from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  rejectClerkEnrollmentDetailsUpdate,
  storeClerkEnrollmentDetailsUpdate,
  updateClerkEnrollmentDetails,
} from 'redux/reducers/clerkEnrollmentDetails';
import { storeClerkExamEventOverview } from 'redux/reducers/clerkExamEventOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* updateClerkEnrollmentDetailsSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollment;
    examEvent: ClerkExamEvent;
  }>
) {
  const { enrollment, examEvent } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkEnrollment,
      SerializationUtils.serializeClerkEnrollment(enrollment)
    );
    const updatedEnrollment = SerializationUtils.deserializeClerkEnrollment(
      apiResponse.data
    );

    const updatedEnrollments = [...examEvent.enrollments];
    const idx = updatedEnrollments.findIndex((e) => e.id === enrollment.id);
    updatedEnrollments[idx] = updatedEnrollment;

    const updatedExamEvent = {
      ...examEvent,
      enrollments: updatedEnrollments,
    };

    yield put(storeClerkEnrollmentDetailsUpdate(updatedEnrollment));
    yield put(storeClerkExamEventOverview(updatedExamEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

export function* watchClerkEnrollmentDetails() {
  yield takeLatest(
    updateClerkEnrollmentDetails.type,
    updateClerkEnrollmentDetailsSaga
  );
}
