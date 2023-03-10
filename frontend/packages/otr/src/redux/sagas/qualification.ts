import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { setAPIError } from 'redux/reducers/APIError';
import { upsertClerkInterpreter } from 'redux/reducers/clerkInterpreter';
import { setClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
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

function* addQualificationSaga(
  action: PayloadAction<{
    qualification: Qualification;
    interpreterId: number;
  }>
) {
  try {
    const apiResponse: AxiosResponse<ClerkInterpreterResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkInterpreter}/${action.payload.interpreterId}/qualification`,
      SerializationUtils.serializeQualification(action.payload.qualification)
    );
    const interpreter = SerializationUtils.deserializeClerkInterpreter(
      apiResponse.data
    );
    yield put(upsertClerkInterpreter(interpreter));
    yield put(setClerkInterpreterOverview(interpreter));
    yield put(addQualificationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAddQualification());
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
    yield put(upsertClerkInterpreter(interpreter));
    yield put(setClerkInterpreterOverview(interpreter));
    yield put(removeQualificationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectRemoveQualification());
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
    yield put(upsertClerkInterpreter(interpreter));
    yield put(setClerkInterpreterOverview(interpreter));
    yield put(updateQualificationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectUpdateQualification());
  }
}

export function* watchQualificationUpdates() {
  yield takeLatest(addQualification.type, addQualificationSaga);
  yield takeLatest(removeQualification.type, removeQualificationSaga);
  yield takeLatest(updateQualification.type, updateQualificationSaga);
}
