import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptClerkListExaminers,
  loadClerkListExaminers,
  rejectClerkListExaminers,
} from 'redux/reducers/clerkListExaminer';
import { NotifierUtils } from 'utils/notifier';

function* loadExaminersSaga() {
  try {
    const response: AxiosResponse<Array<ExaminerDetails>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExaminer,
    );
    yield put(acceptClerkListExaminers(response.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkListExaminers());
  }
}

export function* watchListExaminers() {
  yield takeLatest(loadClerkListExaminers.type, loadExaminersSaga);
}
