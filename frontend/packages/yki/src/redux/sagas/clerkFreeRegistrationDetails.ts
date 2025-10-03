import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkFreeRegistrationDetailsResponse } from 'interfaces/clerkFreeRegistration';
import {
  loadClerkFreeRegistrationDetails,
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

export function* watchClerkFreeRegistrationDetails() {
  yield takeLatest(
    loadClerkFreeRegistrationDetails.type,
    loadClerkFreeRegistrationDetailsSaga,
  );
}
