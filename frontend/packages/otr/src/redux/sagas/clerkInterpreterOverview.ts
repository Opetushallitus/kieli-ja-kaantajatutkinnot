import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { WithId } from 'shared/interfaces';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import { storeClerkInterpreters } from 'redux/reducers/clerkInterpreter';
import {
  loadClerkInterpreterOverview,
  loadingClerkInterpreterOverviewFailed,
  rejectClerkInterpreterOverviewUpdate,
  storeClerkInterpreterOverview,
  storeClerkInterpreterOverviewUpdateSuccess,
  updateClerkInterpreterDetails,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* fetchClerkInterpreterOverview(action: PayloadAction<WithId>) {
  try {
    const response: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkInterpreter}/${action.payload.id}`
    );
    yield put(
      storeClerkInterpreterOverview(
        SerializationUtils.deserializeClerkInterpreter(response.data)
      )
    );
  } catch (error) {
    yield put(loadingClerkInterpreterOverviewFailed());
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

function* updateClerkInterpreterOverview(
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

    yield put(storeClerkInterpreterOverviewUpdateSuccess(interpreter));
  } catch (error) {
    yield put(rejectClerkInterpreterOverviewUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchFetchClerkInterpreterOverview() {
  yield takeLatest(loadClerkInterpreterOverview, fetchClerkInterpreterOverview);
  yield takeLatest(
    updateClerkInterpreterDetails,
    updateClerkInterpreterOverview
  );
}
