import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationResponse } from 'interfaces/clerkFreeRegistration';
import {
  acceptClerkFreeRegistrationInformationRequest,
  approveFreeRegistration,
  FreeRegistrationApprovalStatus,
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrationInformationRequest,
  rejectClerkFreeRegistrations,
  rejectFreeRegistration,
  setFreeRegistrationStatus,
  storeClerkFreeRegistrations,
  submitClerkFreeRegistrationInformationRequest,
} from 'redux/reducers/clerkFreeRegistration';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkFreeRegistrationsSaga() {
  try {
    const response: AxiosResponse<Array<ClerkFreeRegistrationResponse>> =
      yield call(axiosInstance.get, APIEndpoints.ClerkFreeRegistration);
    const freeRegistrations = response.data.map(
      SerializationUtils.deserializeClerkFreeRegistrationResponse,
    );
    yield put(storeClerkFreeRegistrations(freeRegistrations));
  } catch (error) {
    yield put(rejectClerkFreeRegistrations());
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

function* submitClerkFreeRegistrationInformationRequestSaga(
  action: PayloadAction<{ message: string; dueDate: Dayjs }>,
) {
  try {
    const { message, dueDate } = action.payload;
    yield call(
      axiosInstance.post,
      APIEndpoints.ClerkFreeRegistrationInformationRequest,
      {
        message,
        dueDate: dueDate.toISOString(),
      },
    );
    yield put(acceptClerkFreeRegistrationInformationRequest());
  } catch (error) {
    yield put(rejectClerkFreeRegistrationInformationRequest());
  }
}

export function* watchClerkFreeRegistrations() {
  yield takeLatest(
    loadClerkFreeRegistrations.type,
    loadClerkFreeRegistrationsSaga,
  );
  yield takeLatest(approveFreeRegistration.type, approveFreeRegistrationSaga);
  yield takeLatest(rejectFreeRegistration.type, rejectFreeRegistrationSaga);
  yield takeLatest(
    submitClerkFreeRegistrationInformationRequest.type,
    submitClerkFreeRegistrationInformationRequestSaga,
  );
}
