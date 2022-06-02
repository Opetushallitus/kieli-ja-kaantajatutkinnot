import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import {
  loadClerkInterpreters,
  rejectClerkInterpreters,
  storeClerkInterpreters,
} from 'redux/reducers/clerkInterpreter';
import { SerializationUtils } from 'utils/serialization';

function* fetchClerkInterpreters() {
  try {
    const response: AxiosResponse<Array<ClerkInterpreterResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkInterpreter
    );
    const interpreters = response.data.map(
      SerializationUtils.deserializeClerkInterpreterResponse
    );
    yield put(storeClerkInterpreters(interpreters));
  } catch (error) {
    yield put(rejectClerkInterpreters());
  }
}

export function* watchFetchClerkInterpreters() {
  yield takeLatest(loadClerkInterpreters, fetchClerkInterpreters);
}
