import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import { setAPIError } from 'redux/reducers/APIError';
import { upsertClerkInterpreter } from 'redux/reducers/clerkInterpreter';
import {
  loadClerkInterpreterOverview,
  rejectClerkInterpreterDetailsUpdate,
  rejectClerkInterpreterOverview,
  storeClerkInterpreterOverview,
  updateClerkInterpreterDetails,
  updatingClerkInterpreterDetailsSucceeded,
} from 'redux/reducers/clerkInterpreterOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkInterpreterOverviewSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkInterpreter}/${action.payload}`
    );
    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      response.data
    );
    yield put(storeClerkInterpreterOverview(interpreter));
  } catch (error) {
    yield put(rejectClerkInterpreterOverview());
  }
}

function* updateClerkInterpreterDetailsSaga(
  action: PayloadAction<ClerkInterpreter>
) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkInterpreter}`,
      SerializationUtils.serializeClerkInterpreter(action.payload)
    );

    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      response.data
    );
    yield upsertClerkInterpreter(interpreter);
    yield put(updatingClerkInterpreterDetailsSucceeded(interpreter));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkInterpreterDetailsUpdate());
  }
}

export function* watchClerkInterpreterOverview() {
  yield takeLatest(
    loadClerkInterpreterOverview,
    loadClerkInterpreterOverviewSaga
  );
  yield takeLatest(
    updateClerkInterpreterDetails,
    updateClerkInterpreterDetailsSaga
  );
}
