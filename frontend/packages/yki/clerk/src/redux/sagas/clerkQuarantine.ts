import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkQuarantineMatchResponse,
  ClerkQuarantineReviewResponse,
  CreateClerkQuarantineRequest,
} from 'interfaces/clerkQuarantine';
import {
  createClerkQuarantine,
  loadClerkQuarantineMatches,
  loadClerkQuarantineReviews,
  rejectClerkQuarantineMatches,
  rejectClerkQuarantineReviews,
  rejectCreateClerkQuarantine,
  rejectQuarantineReview,
  resolveCreateClerkQuarantine,
  resolveQuarantineReview,
  setQuarantineReview,
  storeClerkQuarantineMatches,
  storeClerkQuarantineReviews,
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

function* loadClerkQuarantineReviewsSaga() {
  try {
    const response: AxiosResponse<ClerkQuarantineReviewResponse[]> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkQuarantineReviews,
    );
    const reviews = response.data.map(
      SerializationUtils.deserializeClerkQuarantineReviewResponse,
    );
    yield put(storeClerkQuarantineReviews(reviews));
  } catch (error) {
    yield put(rejectClerkQuarantineReviews());
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
    yield put(loadClerkQuarantineReviews());
  } catch (error) {
    yield put(rejectQuarantineReview());
  }
}

function* createClerkQuarantineSaga(
  action: PayloadAction<CreateClerkQuarantineRequest>,
) {
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.ClerkQuarantine,
      action.payload,
    );
    yield put(resolveCreateClerkQuarantine());
  } catch (error) {
    yield put(rejectCreateClerkQuarantine());
  }
}

export function* watchClerkQuarantine() {
  yield takeLatest(
    loadClerkQuarantineMatches.type,
    loadClerkQuarantineMatchesSaga,
  );
  yield takeLatest(
    loadClerkQuarantineReviews.type,
    loadClerkQuarantineReviewsSaga,
  );
  yield takeLatest(setQuarantineReview.type, setQuarantineReviewSaga);
  yield takeLatest(createClerkQuarantine.type, createClerkQuarantineSaga);
}
