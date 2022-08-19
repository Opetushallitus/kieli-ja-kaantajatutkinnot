import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import { storeClerkInterpreters } from 'redux/reducers/clerkInterpreter';
import {
  loadClerkInterpreterOverview,
  rejectClerkInterpreterDetailsUpdate,
  rejectClerkInterpreterOverview,
  storeClerkInterpreterOverview,
  updateClerkInterpreterDetails,
  updatingClerkInterpreterDetailsSucceeded,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkInterpreterOverviewSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkInterpreter}/${action.payload}`
    );
    yield put(
      storeClerkInterpreterOverview(
        SerializationUtils.deserializeClerkInterpreter(response.data)
      )
    );
  } catch (error) {
    yield put(rejectClerkInterpreterOverview());
  }
}

function* updateClerkInterpreterState(interpreter: ClerkInterpreter) {
  const { interpreters } = yield select(clerkInterpretersSelector);
  const interpreterIndex = interpreters.findIndex(
    (i: ClerkInterpreter) => i.id === interpreter.id
  );

  yield put(
    storeClerkInterpreters([
      ...interpreters.slice(0, interpreterIndex),
      interpreter,
      ...interpreters.slice(interpreterIndex + 1),
    ])
  );
}

function* updateClerkInterpreterDetailsSaga(
  action: PayloadAction<ClerkInterpreter>
) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkInterpreter}`,
      SerializationUtils.serializeClerkInterpreter(
        action.payload as ClerkInterpreter
      )
    );

    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      response.data
    );
    yield updateClerkInterpreterState(interpreter);
    yield put(updatingClerkInterpreterDetailsSucceeded(interpreter));
  } catch (error) {
    yield put(rejectClerkInterpreterDetailsUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
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
