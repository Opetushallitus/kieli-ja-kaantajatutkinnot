import { AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import {
  loadClerkInterpreters,
  rejectClerkInterpreters,
  storeClerkInterpreters,
} from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkInterpretersSaga() {
  try {
    const response: AxiosResponse<Array<ClerkInterpreterResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkInterpreter
    );
    const interpreters = response.data.map(
      SerializationUtils.deserializeClerkInterpreter
    );
    yield put(storeClerkInterpreters(interpreters));
  } catch (error) {
    yield put(rejectClerkInterpreters());
  }
}

// TODO: use in interpreter update, and in all qualification operations
export function* updateClerkInterpretersState(
  updatedInterpreters: Array<ClerkInterpreter>
) {
  const { interpreters } = yield select(clerkInterpretersSelector);

  if (interpreters.length <= 0) {
    yield put(loadClerkInterpreters());
  }
  yield put(storeClerkInterpreters(updatedInterpreters));
}

export function* watchClerkInterpreters() {
  yield takeLatest(loadClerkInterpreters, loadClerkInterpretersSaga);
}
