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
  ClerkPaymentResponse,
} from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptKoskiEducationDetailsRefresh,
  createClerkEnrollmentPaymentLink,
  moveEnrollment,
  moveEnrollmentSucceeded,
  rejectClerkEnrollmentDetailsUpdate,
  rejectClerkEnrollmentPaymentLink,
  rejectClerkPaymentRefunded,
  rejectMoveEnrollment,
  setClerkPaymentRefunded,
  startKoskiEducationDetailsRefresh,
  storeClerkEnrollmentDetailsUpdate,
  storeClerkEnrollmentPaymentLink,
  storeClerkPaymentRefunded,
  updateClerkEnrollmentDetails,
} from 'redux/reducers/clerkEnrollmentDetails';
import { storeClerkExamEventOverview } from 'redux/reducers/clerkExamEventOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* createClerkEnrollmentPaymentLinkSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkPaymentLinkResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkEnrollment}/${action.payload}/paymentLink`,
      {},
    );
    const paymentLink = SerializationUtils.deserializeClerkPaymentLink(
      apiResponse.data,
    );

    yield put(storeClerkEnrollmentPaymentLink(paymentLink));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkEnrollmentPaymentLink());
  }
}

function* updateClerkEnrollmentDetailsSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollment;
    examEvent: ClerkExamEvent;
  }>,
) {
  const { enrollment, examEvent } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkEnrollment,
      SerializationUtils.serializeClerkEnrollment(enrollment),
    );
    const updatedEnrollment = SerializationUtils.deserializeClerkEnrollment(
      apiResponse.data,
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
      action.payload,
    );

    yield put(moveEnrollmentSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectMoveEnrollment());
  }
}

function* setClerkPaymentRefundedSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkPaymentResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkPayment}/${action.payload}/refunded`,
      {},
    );
    const payment = SerializationUtils.deserializeClerkPayment(
      apiResponse.data,
    );

    yield put(storeClerkPaymentRefunded(payment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkPaymentRefunded());
  }
}

function* startKoskiEducationDetailsRefreshSaga(action: PayloadAction<number>) {
  try {
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkRefreshKoskiEducationDetails.replace(
        /:enrollmentId/,
        `${action.payload}`,
      )}`,
    );
    yield put(acceptKoskiEducationDetailsRefresh());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
  }
}

export function* watchClerkEnrollmentDetails() {
  yield takeLatest(
    createClerkEnrollmentPaymentLink,
    createClerkEnrollmentPaymentLinkSaga,
  );
  yield takeLatest(
    updateClerkEnrollmentDetails.type,
    updateClerkEnrollmentDetailsSaga,
  );
  yield takeLatest(moveEnrollment, moveEnrollmentSaga);
  yield takeLatest(setClerkPaymentRefunded, setClerkPaymentRefundedSaga);
  yield takeLatest(
    startKoskiEducationDetailsRefresh,
    startKoskiEducationDetailsRefreshSaga,
  );
}
