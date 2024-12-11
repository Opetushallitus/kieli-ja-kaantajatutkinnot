import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetailsInit } from 'interfaces/examinerDetails';
import {
  loadExaminerDetailsInit,
  rejectExaminerDetailsInit,
  storeExaminerDetailsInit,
} from 'redux/reducers/examinerDetailsInit';

function* loadExaminerDetailsInitSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ExaminerDetailsInit> = yield call(
      axiosInstance.get,
      APIEndpoints.ExaminerDetailsInit.replace(/:oid/, action.payload),
    );
    yield put(storeExaminerDetailsInit(response.data));
  } catch (error) {
    yield put(rejectExaminerDetailsInit());
  }
}

export function* watchExaminerDetailsInit() {
  yield takeLatest(loadExaminerDetailsInit.type, loadExaminerDetailsInitSaga);
}
