import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  ClerkActiveQuarantineResponse,
  ClerkQuarantineMatchResponse,
  ClerkQuarantineReviewResponse,
  CreateClerkQuarantineRequest,
  UpdateClerkQuarantineRequest,
} from 'interfaces/clerkQuarantine';
import { setAPIError } from 'redux/reducers/APIError';
import {
  createClerkQuarantine,
  loadClerkActiveQuarantines,
  loadClerkQuarantineMatches,
  loadClerkQuarantineReviews,
  rejectClerkActiveQuarantines,
  rejectClerkQuarantineMatches,
  rejectClerkQuarantineReviews,
  rejectCreateClerkQuarantine,
  rejectQuarantineReview,
  rejectUpdateClerkQuarantine,
  resolveCreateClerkQuarantine,
  resolveQuarantineReview,
  resolveUpdateClerkQuarantine,
  setQuarantineReview,
  storeClerkActiveQuarantines,
  storeClerkQuarantineMatches,
  storeClerkQuarantineReviews,
  updateClerkQuarantine,
} from 'redux/reducers/clerkQuarantine';
import { NotifierUtils } from 'utils/notifier';
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

function* loadClerkActiveQuarantinesSaga() {
  try {
    const response: AxiosResponse<ClerkActiveQuarantineResponse[]> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkQuarantine,
    );
    const activeQuarantines = response.data.map(
      SerializationUtils.deserializeClerkActiveQuarantineResponse,
    );
    yield put(storeClerkActiveQuarantines(activeQuarantines));
  } catch (error) {
    yield put(rejectClerkActiveQuarantines());
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
  const t = translateOutsideComponent();
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.ClerkQuarantine,
      action.payload,
    );
    yield put(resolveCreateClerkQuarantine());
    yield put(loadClerkQuarantineMatches());
  } catch (error) {
    yield put(rejectCreateClerkQuarantine());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.addingQuarantineFailed'),
    );

    yield put(setAPIError(errorMessage));
  }
}

function* updateClerkQuarantineSaga(
  action: PayloadAction<UpdateClerkQuarantineRequest>,
) {
  const t = translateOutsideComponent();
  const { id, ...body } = action.payload;
  try {
    yield call(
      axiosInstance.put,
      APIEndpoints.ClerkQuarantineById.replace(':id', String(id)),
      body,
    );
    yield put(resolveUpdateClerkQuarantine());
    yield put(loadClerkActiveQuarantines());
  } catch (error) {
    yield put(rejectUpdateClerkQuarantine());

    const errorMessage = NotifierUtils.getAPIErrorMessage(
      error as AxiosError,
      t('yki.common.errors.updatingQuarantineFailed'),
    );

    yield put(setAPIError(errorMessage));
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
  yield takeLatest(
    loadClerkActiveQuarantines.type,
    loadClerkActiveQuarantinesSaga,
  );
  yield takeLatest(setQuarantineReview.type, setQuarantineReviewSaga);
  yield takeLatest(createClerkQuarantine.type, createClerkQuarantineSaga);
  yield takeLatest(updateClerkQuarantine.type, updateClerkQuarantineSaga);
}
