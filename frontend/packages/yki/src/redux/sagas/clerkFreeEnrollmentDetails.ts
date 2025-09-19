import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { ClerkFreeEnrollmentDetailsResponse } from 'interfaces/clerkFreeEnrollment';
import {
  loadClerkFreeEnrollmentDetails,
  rejectClerkFreeEnrollmentDetails,
  storeClerkFreeEnrollmentDetails,
} from 'redux/reducers/clerkFreeEnrollmentDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkFreeEnrollmentDetailsSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<ClerkFreeEnrollmentDetailsResponse> =
      yield call(
        axiosInstance.get,
        '/yki/api/virkailija/free-enrollments/:id'.replace(
          /:id$/,
          `${action.payload}`,
        ),
      );
    const freeEnrollmentDetails =
      SerializationUtils.deserializeClerkFreeEnrollmentDetailsResponse(
        response.data,
      );
    yield put(storeClerkFreeEnrollmentDetails(freeEnrollmentDetails));
  } catch (error) {
    yield put(rejectClerkFreeEnrollmentDetails());
  }
}

export function* watchClerkFreeEnrollmentDetails() {
  yield takeLatest(
    loadClerkFreeEnrollmentDetails.type,
    loadClerkFreeEnrollmentDetailsSaga,
  );
}
