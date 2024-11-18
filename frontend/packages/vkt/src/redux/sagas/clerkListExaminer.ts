import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetailsResponse } from 'interfaces/examinerDetails';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptClerkListExaminers,
  loadClerkListExaminers,
  rejectClerkListExaminers,
} from 'redux/reducers/clerkListExaminer';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadExaminersSaga() {
  try {
    const response: AxiosResponse<Array<ExaminerDetailsResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExaminer,
    );
    yield put(
      acceptClerkListExaminers(
        response.data.map((v) =>
          SerializationUtils.deserializeExaminerDetails(v),
        ),
      ),
    );
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkListExaminers());
  }
}

export function* watchListExaminers() {
  yield takeLatest(loadClerkListExaminers.type, loadExaminersSaga);
}
