import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationDetailsResponse } from 'interfaces/clerkFreeRegistration';
import {
  loadClerkFreeRegistrationDetails,
  rejectClerkFreeRegistrationDetails,
  storeClerkFreeRegistrationDetails,
} from 'redux/reducers/clerkFreeRegistrationDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkFreeRegistrationDetailsSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<ClerkFreeRegistrationDetailsResponse> =
      yield call(
        axiosInstance.get,
        APIEndpoints.ClerkFreeRegistrationDetails.replace(
          /:id$/,
          `${action.payload}`,
        ),
      );
    const freeRegistrationDetails =
      SerializationUtils.deserializeClerkFreeRegistrationDetailsResponse(
        response.data,
      );
    yield put(storeClerkFreeRegistrationDetails(freeRegistrationDetails));
  } catch (error) {
    yield put(rejectClerkFreeRegistrationDetails());
  }
}

function* approveFreeRegistrationSaga() {
  try {
    yield call(axiosInstance.put, APIEndpoints.ApproveClerkFreeRegistration);
    yield put(
      setFreeRegistrationStatus(FreeRegistrationApprovalStatus.ApprovalSuccess),
    );
  } catch (error) {
    yield put(
      setFreeRegistrationStatus(FreeRegistrationApprovalStatus.ApprovalError),
    );
  }
}

function* rejectFreeRegistrationSaga() {
  try {
    yield call(axiosInstance.put, APIEndpoints.RejectClerkFreeRegistration);
    yield put(
      setFreeRegistrationStatus(FreeRegistrationApprovalStatus.RejectSuccess),
    );
  } catch (error) {
    yield put(
      setFreeRegistrationStatus(FreeRegistrationApprovalStatus.RejectError),
    );
  }
}

export function* watchClerkFreeRegistrationDetails() {
  yield takeLatest(
    loadClerkFreeRegistrationDetails.type,
    loadClerkFreeRegistrationDetailsSaga,
  );

  yield takeLatest(approveFreeRegistration.type, approveFreeRegistrationSaga);
  yield takeLatest(rejectFreeRegistration.type, rejectFreeRegistrationSaga);
}
