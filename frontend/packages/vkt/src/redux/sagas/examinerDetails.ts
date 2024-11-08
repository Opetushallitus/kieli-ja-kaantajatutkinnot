import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse, isAxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints, APIError } from 'enums/api';
import { ExaminerDetailsResponse } from 'interfaces/examinerDetails';
import {
  loadExaminerDetails,
  rejectExaminerDetails,
  storeExaminerDetails,
} from 'redux/reducers/examinerDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadExaminerDetailsSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ExaminerDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ExaminerDetails.replace(/:oid/, action.payload),
    );
    yield put(
      storeExaminerDetails(
        SerializationUtils.deserializeExaminerDetails(response.data),
      ),
    );
  } catch (error) {
    let initialized = true;
    if (isAxiosError(error)) {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === APIError.ExaminerNotFound) {
        initialized = false;
      }
    }
    yield put(rejectExaminerDetails(initialized));
  }
}

export function* watchExaminerDetails() {
  yield takeLatest(loadExaminerDetails.type, loadExaminerDetailsSaga);
}
