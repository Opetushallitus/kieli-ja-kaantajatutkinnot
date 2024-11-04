import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptExaminers,
  loadExaminers,
  rejectExaminers,
} from 'redux/reducers/clerkListExaminer';
import { NotifierUtils } from 'utils/notifier';

function* loadExaminersSaga() {
  try {
    const response: AxiosResponse<Array<ExaminerDetails>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExaminer,
    );
    yield put(acceptExaminers(response.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectExaminers());
  }
}

export function* watchListExaminers() {
  yield takeLatest(loadExaminers.type, loadExaminersSaga);
}
