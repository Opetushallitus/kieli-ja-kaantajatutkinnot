import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { WithId } from 'shared/interfaces';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import {
  loadClerkInterpreterOverview,
  loadingClerkInterpreterOverviewFailed,
  storeClerkInterpreterOverview,
} from 'redux/reducers/clerkInterpreterOverview';
import { SerializationUtils } from 'utils/serialization';

function* fetchClerkInterpreterOverview(action: PayloadAction<WithId>) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkInterpreter}/${action.payload.id}`
    );
    yield put(
      storeClerkInterpreterOverview(
        SerializationUtils.deserializeClerkInterpreterResponse(response.data)
      )
    );
  } catch (error) {
    yield put(loadingClerkInterpreterOverviewFailed());
  }
}

export function* watchFetchClerkInterpreterOverview() {
  yield takeLatest(loadClerkInterpreterOverview, fetchClerkInterpreterOverview);
}
