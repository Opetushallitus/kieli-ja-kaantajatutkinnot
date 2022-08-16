import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { setClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import {
  addQualification,
  addQualificationSucceeded,
  rejectAddQualification,
  rejectRemoveQualification,
  rejectUpdateQualification,
  removeQualification,
  removeQualificationSucceeded,
  updateQualification,
  updateQualificationSucceeded,
} from 'redux/reducers/qualification';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* addQualificationSaga(action: PayloadAction<Qualification>) {
  try {
    const { interpreterId } = action.payload;
    if (!interpreterId) {
      throw new Error();
    }
    const apiResponse: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkInterpreter}/${interpreterId}/qualification`,
      SerializationUtils.serializeQualification(action.payload)
    );

    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      apiResponse.data
    );

    yield put(setClerkInterpreterOverview(interpreter));
    yield put(addQualificationSucceeded());
  } catch (error) {
    yield put(rejectAddQualification());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* removeQualificationSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.delete,
      `${APIEndpoints.Qualification}/${action.payload}`
    );

    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      apiResponse.data
    );

    yield put(setClerkInterpreterOverview(interpreter));
    yield put(removeQualificationSucceeded());
  } catch (error) {
    yield put(rejectRemoveQualification());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* updateQualificationSaga(action: PayloadAction<Qualification>) {
  try {
    const apiResponse: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.Qualification,
      SerializationUtils.serializeQualification(action.payload)
    );
    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      apiResponse.data
    );
    yield put(setClerkInterpreterOverview(interpreter));
    yield put(updateQualificationSucceeded());
  } catch (error) {
    yield put(rejectUpdateQualification());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchQualificationUpdates() {
  yield takeLatest(addQualification, addQualificationSaga);
  yield takeLatest(removeQualification, removeQualificationSaga);
  yield takeLatest(updateQualification, updateQualificationSaga);
}
