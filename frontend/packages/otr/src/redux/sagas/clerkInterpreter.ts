import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import {
  errorLoading,
  storeClerkInterpreters,
} from 'redux/reducers/clerkInterpreter';
import { SerializationUtils } from 'utils/serialization';

export function* storeResponse(interpreters: Array<ClerkInterpreter>) {
  yield put(storeClerkInterpreters(interpreters));
}

export function* fetchClerkInterpreters() {
  try {
    const response: AxiosResponse<Array<ClerkInterpreterResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkInterpreter
    );
    const interpreters = response.data.map(
      SerializationUtils.deserializeClerkInterpreterResponse
    );
    yield call(storeResponse, interpreters);
  } catch (error) {
    yield put(errorLoading());
  }
}

export function* watchFetchClerkInterpreters() {
  yield takeLatest(
    'clerkInterpreter/loadClerkInterpreters',
    fetchClerkInterpreters
  );
}
