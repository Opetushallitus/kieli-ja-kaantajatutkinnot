import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkQuarantineMatchResponse } from 'interfaces/clerkQuarantine';
import {
  loadClerkQuarantineMatches,
  rejectClerkQuarantineMatches,
  rejectQuarantineReview,
  resolveQuarantineReview,
  setQuarantineReview,
  storeClerkQuarantineMatches,
} from 'redux/reducers/clerkQuarantine';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkQuarantineMatchesSaga() {
  try {
    const response: AxiosResponse<ClerkQuarantineMatchResponse[]> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkQuarantineMatches,
    );
    const matches = response.data.map(
      SerializationUtils.deserializeClerkQuarantineMatchResponse,
    );
    yield put(storeClerkQuarantineMatches(matches));
  } catch (error) {
    yield put(rejectClerkQuarantineMatches());
  }
}

function* setQuarantineReviewSaga(
  action: PayloadAction<{
    quarantineId: number;
    registrationId: number;
    matchConfirmed: boolean;
  }>,
) {
  const { quarantineId, registrationId, matchConfirmed } = action.payload;

  try {
    yield call(
      axiosInstance.put,
      APIEndpoints.ClerkQuarantineSetReview.replace(
        ':id',
        String(quarantineId),
      ).replace(':regId', String(registrationId)),
      { quarantined: matchConfirmed },
    );
    yield put(resolveQuarantineReview());
    yield put(loadClerkQuarantineMatches());
  } catch (error) {
    yield put(rejectQuarantineReview());
  }
}

export function* watchClerkQuarantine() {
  yield takeLatest(
    loadClerkQuarantineMatches.type,
    loadClerkQuarantineMatchesSaga,
  );
  yield takeLatest(setQuarantineReview.type, setQuarantineReviewSaga);
}
