import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import { upsertExamEvents } from 'redux/reducers/clerkListExamEvent';
import {
  rejectClerkNewExamDate,
  saveClerkNewExamDate,
  successClerkNewExamDate,
} from 'redux/reducers/clerkNewExamDate';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* saveClerkNewExamDateSaga(action: PayloadAction<ClerkExamEvent>) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkExamEvent,
      SerializationUtils.serializeNewClerkExamEvent(action.payload)
    );

    if (!apiResponse.data.id) {
      throw new Error('Save failed. No Id found.');
    }

    const examEvent: ClerkExamEvent =
      SerializationUtils.deserializeClerkExamEvent({
        ...apiResponse.data,
        enrollments: [],
      });

    yield put(successClerkNewExamDate());
    yield put(upsertExamEvents(examEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkNewExamDate());
  }
}

export function* watchClerkNewExamDate() {
  yield takeLatest(saveClerkNewExamDate, saveClerkNewExamDateSaga);
}
