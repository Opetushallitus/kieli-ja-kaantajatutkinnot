import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { ClerkFreeEnrollmentResponse } from 'interfaces/clerkFreeEnrollment';
import {
  loadClerkFreeEnrollments,
  rejectClerkFreeEnrollments,
  storeClerkFreeEnrollments,
} from 'redux/reducers/clerkFreeEnrollment';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkFreeEnrollmentsSaga() {
  try {
    const response: AxiosResponse<Array<ClerkFreeEnrollmentResponse>> =
      yield call(axiosInstance.get, '/yki/api/virkailija/free-enrollments');
    const freeEnrollments = response.data.map(
      SerializationUtils.deserializeClerkFreeEnrollmentResponse,
    );
    yield put(storeClerkFreeEnrollments(freeEnrollments));
  } catch (error) {
    yield put(rejectClerkFreeEnrollments());
  }
}

export function* watchClerkFreeEnrollments() {
  yield takeLatest(loadClerkFreeEnrollments.type, loadClerkFreeEnrollmentsSaga);
}
