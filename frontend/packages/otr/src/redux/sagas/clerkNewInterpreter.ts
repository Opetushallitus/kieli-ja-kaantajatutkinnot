import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import { setAPIError } from 'redux/reducers/APIError';
import { upsertClerkInterpreter } from 'redux/reducers/clerkInterpreter';
import { setClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
import {
  rejectClerkNewInterpreter,
  saveClerkNewInterpreter,
  storeClerkNewInterpreter,
} from 'redux/reducers/clerkNewInterpreter';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* saveClerkNewInterpreterSaga(
  action: PayloadAction<ClerkNewInterpreter>
) {
  try {
    const apiResponse: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkInterpreter,
      SerializationUtils.serializeClerkNewInterpreter(action.payload)
    );
    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      apiResponse.data
    );
    yield put(upsertClerkInterpreter(interpreter));
    yield put(storeClerkNewInterpreter(interpreter.id));
    yield put(setClerkInterpreterOverview(interpreter));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkNewInterpreter());
  }
}

export function* watchClerkNewInterpreterSave() {
  yield takeLatest(saveClerkNewInterpreter, saveClerkNewInterpreterSaga);
}
