import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import {
  rejectClerkNewExamDate,
  saveClerkNewExamDate,
  storeClerkNewExamDate,
} from 'redux/reducers/clerkNewExamDate';
import { SerializationUtils } from 'utils/serialization';

function* saveClerkNewExamDateSaga(action: PayloadAction<ClerkExamEvent>) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkExamEvent,
      action.payload
    );

    const clerkExamEvent = SerializationUtils.deserializeClerkExamEvent(
      apiResponse.data
    );
    yield put(storeClerkNewExamDate(clerkExamEvent.id));
  } catch (error) {
    yield put(rejectClerkNewExamDate());
  }
}

export function* watchClerkNewExamDate() {
  yield takeLatest(saveClerkNewExamDate, saveClerkNewExamDateSaga);
}
