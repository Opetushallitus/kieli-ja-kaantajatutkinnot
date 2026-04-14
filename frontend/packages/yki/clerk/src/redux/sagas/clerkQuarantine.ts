import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkQuarantineMatchesResponse } from 'interfaces/clerkQuarantine';
import {
  loadClerkQuarantineMatches,
  rejectClerkQuarantineMatches,
  storeClerkQuarantineMatches,
} from 'redux/reducers/clerkQuarantine';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkQuarantineMatchesSaga() {
  try {
    const response: AxiosResponse<ClerkQuarantineMatchesResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkQuarantineMatches,
    );
    const matches = response.data.quarantineMatches.map(
      SerializationUtils.deserializeClerkQuarantineMatchResponse,
    );
    yield put(storeClerkQuarantineMatches(matches));
  } catch (error) {
    yield put(rejectClerkQuarantineMatches());
  }
}

export function* watchClerkQuarantine() {
  yield takeLatest(
    loadClerkQuarantineMatches.type,
    loadClerkQuarantineMatchesSaga,
  );
}
