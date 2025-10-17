import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationResponse } from 'interfaces/clerkFreeRegistration';
import {
  acceptClerkFreeRegistrationSupplementRequest,
  approveFreeRegistration,
  FreeRegistrationModalStatus,
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  rejectClerkFreeRegistrationSupplementRequest,
  rejectFreeRegistration,
  setFreeRegistrationStatus,
  storeClerkFreeRegistrations,
  submitClerkFreeRegistrationSupplementRequest,
} from 'redux/reducers/clerkFreeRegistration';
import { loadClerkFreeRegistrationDetails } from 'redux/reducers/clerkFreeRegistrationDetails';
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
      setFreeRegistrationStatus(FreeRegistrationModalStatus.ApprovalSuccess),
    );
  } catch (error) {
    yield put(
      setFreeRegistrationStatus(FreeRegistrationModalStatus.ApprovalError),
    );
  }
}

function* rejectFreeRegistrationSaga() {
  try {
    yield call(axiosInstance.put, APIEndpoints.RejectClerkFreeRegistration);
    yield put(
      setFreeRegistrationStatus(FreeRegistrationModalStatus.RejectSuccess),
    );
  } catch (error) {
    yield put(
      setFreeRegistrationStatus(FreeRegistrationModalStatus.RejectError),
    );
  }
}

function* submitClerkFreeRegistrationSupplementRequestSaga(
  action: PayloadAction<{
    registrationId: number;
    message: string;
    dueDate: Dayjs;
  }>,
) {
  try {
    const { registrationId, message, dueDate } = action.payload;
    const endpoint =
      APIEndpoints.ClerkFreeRegistrationSupplementRequest.replace(
        ':id',
        `${registrationId}`,
      );
    yield call(axiosInstance.post, endpoint, {
      message,
      dueDate: dueDate.toISOString(),
    });
    yield put(acceptClerkFreeRegistrationSupplementRequest());
    yield put(loadClerkFreeRegistrationDetails(registrationId));
    yield put(loadClerkFreeRegistrations());
  } catch (error) {
    yield put(rejectClerkFreeRegistrationSupplementRequest());
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
    submitClerkFreeRegistrationSupplementRequest.type,
    submitClerkFreeRegistrationSupplementRequestSaga,
  );
}
