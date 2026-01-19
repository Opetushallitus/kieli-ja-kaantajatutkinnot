import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationDetailsResponse } from 'interfaces/clerkFreeRegistration';
import {
  acceptAddComment,
  addComment,
  loadClerkFreeRegistrationDetails,
  rejectAddComment,
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

function* addCommentSaga(
  action: PayloadAction<{
    freeRegistrationId: number;
    comment: string;
  }>,
) {
  const { freeRegistrationId, ...requestBody } = action.payload;
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.ClerkFreeRegistrationDetailsMessages.replace(
        ':id',
        `${freeRegistrationId}`,
      ),
      {
        ...requestBody,
      },
    );
    yield put(acceptAddComment());
  } catch (error) {
    yield put(rejectAddComment());
  }
}

export function* watchClerkFreeRegistrationDetails() {
  yield takeLatest(
    loadClerkFreeRegistrationDetails.type,
    loadClerkFreeRegistrationDetailsSaga,
  );
  yield takeLatest(addComment.type, addCommentSaga);
}
