import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationResponse } from 'interfaces/clerkFreeRegistration';
import {
  acceptFreeRegistrationApproval,
  approveFreeRegistration,
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  rejectFreeRegistrationApproval,
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
    yield put(acceptFreeRegistrationApproval());
  } catch (error) {
    yield put(rejectFreeRegistrationApproval());
  }
}

export function* watchClerkFreeRegistrations() {
  yield takeLatest(
    loadClerkFreeRegistrations.type,
    loadClerkFreeRegistrationsSaga,
  );

  yield takeLatest(approveFreeRegistration.type, approveFreeRegistrationSaga);
}
