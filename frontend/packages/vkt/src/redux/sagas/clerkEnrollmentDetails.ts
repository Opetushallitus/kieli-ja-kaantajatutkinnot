import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollment,
  ClerkEnrollmentMove,
  ClerkEnrollmentResponse,
  ClerkPaymentLinkResponse,
} from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  createClerkEnrollmentPaymentLink,
  moveEnrollment,
  moveEnrollmentSucceeded,
  rejectClerkEnrollmentDetailsUpdate,
  rejectMoveEnrollment,
  storeClerkEnrollmentDetailsUpdate,
  storeClerkEnrollmentPaymentLink,
  updateClerkEnrollmentDetails,
} from 'redux/reducers/clerkEnrollmentDetails';
import { storeClerkExamEventOverview } from 'redux/reducers/clerkExamEventOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* createClerkEnrollmentPaymentLinkSaga(
  action: PayloadAction<ClerkEnrollment>
) {
  const enrollment = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkPaymentLinkResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkEnrollment}/payment/${enrollment.id}/link`,
      {}
    );

    const paymentLink = SerializationUtils.deserializeClerkPaymentLink(
      apiResponse.data
    );

    yield put(storeClerkEnrollmentPaymentLink(paymentLink));
  } catch (error) {}
}

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

function* moveEnrollmentSaga(action: PayloadAction<ClerkEnrollmentMove>) {
  try {
    yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkEnrollment}/move`,
      action.payload
    );

    yield put(moveEnrollmentSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectMoveEnrollment());
  }
}

export function* watchClerkEnrollmentDetails() {
  yield takeLatest(
    updateClerkEnrollmentDetails.type,
    updateClerkEnrollmentDetailsSaga
  );
  yield takeLatest(moveEnrollment, moveEnrollmentSaga);
  yield takeLatest(
    createClerkEnrollmentPaymentLink,
    createClerkEnrollmentPaymentLinkSaga
  );
}
