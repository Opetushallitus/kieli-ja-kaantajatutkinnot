import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationResponse } from 'interfaces/clerkFreeRegistration';
import {
  approveFreeRegistration,
  FreeRegistrationApprovalStatus,
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  rejectFreeRegistration,
  setFreeRegistrationStatus,
  storeClerkFreeRegistrations,
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

export function* watchClerkFreeRegistrations() {
  yield takeLatest(
    loadClerkFreeRegistrations.type,
    loadClerkFreeRegistrationsSaga,
  );

  yield takeLatest(approveFreeRegistration.type, approveFreeRegistrationSaga);
  yield takeLatest(rejectFreeRegistration.type, rejectFreeRegistrationSaga);
}
