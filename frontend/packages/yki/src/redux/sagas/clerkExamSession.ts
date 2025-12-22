import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkExamSessionResponse } from 'interfaces/clerkExamSession';
import {
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  storeExamSessionDetails,
} from 'redux/reducers/clerkExamSession';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkExamSessionDetailsSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ClerkExamSessionResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExamSession.replace(/:id$/, action.payload),
    );
    const clerkExamSession =
      SerializationUtils.deserializeClerkExamSessionResponse(response.data);

    yield put(storeExamSessionDetails(clerkExamSession));
  } catch (error) {
    yield put(rejectExamSessionDetails());
  }
}

export function* watchClerkExamSession() {
  yield takeLatest(
    loadClerkExamSessionDetails.type,
    loadClerkExamSessionDetailsSaga,
  );
}
