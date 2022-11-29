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
import {
  rejectClerkNewExamDate,
  resetClerkNewExamDate,
  saveClerkNewExamDate,
} from 'redux/reducers/clerkNewExamDate';
import { NotifierUtils } from 'utils/notifier';

function* saveClerkNewExamDateSaga(action: PayloadAction<ClerkExamEvent>) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkExamEvent,
      action.payload
    );

    if (!apiResponse.data.id) {
      throw new Error('Save failed. No Id found.');
    }

    yield put(resetClerkNewExamDate());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkNewExamDate());
  }
}

export function* watchClerkNewExamDate() {
  yield takeLatest(saveClerkNewExamDate, saveClerkNewExamDateSaga);
}
