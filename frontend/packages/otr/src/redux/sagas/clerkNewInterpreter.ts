import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import {
  rejectClerkNewInterpreter,
  saveClerkNewInterpreter,
  storeClerkNewInterpreter,
} from 'redux/reducers/clerkNewInterpreter';
import { showNotifierToast } from 'redux/reducers/notifier';
import { updateClerkInterpretersState } from 'redux/sagas/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';
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
    const { interpreters } = yield select(clerkInterpretersSelector);
    const updatedClerkInterpreters = [...interpreters, interpreter];
    yield updateClerkInterpretersState(updatedClerkInterpreters);

    yield put(storeClerkNewInterpreter(interpreter.id));
  } catch (error) {
    yield put(rejectClerkNewInterpreter());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchClerkNewInterpreterSave() {
  yield takeLatest(saveClerkNewInterpreter, saveClerkNewInterpreterSaga);
}
