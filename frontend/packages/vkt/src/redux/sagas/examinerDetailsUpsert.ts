import { AxiosError } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetailsUpsert } from 'interfaces/examinerDetailsUpsert';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptExaminerDetailsUpsert,
  rejectExaminerDetailsUpsert,
  startExaminerDetailsUpsert,
} from 'redux/reducers/examinerDetailsUpsert';
import { examinerDetailsUpsertSelector } from 'redux/selectors/examinerDetailsUpsert';
import { NotifierUtils } from 'utils/notifier';

function* startExaminerDetailsUpsertSaga() {
  try {
    const { examinerDetails }: { examinerDetails: ExaminerDetailsUpsert } =
      yield select(examinerDetailsUpsertSelector);

    const { oid: _oid, id: _id, ...detailsToSubmit } = examinerDetails;
    yield call(
      axiosInstance.post,
      APIEndpoints.ExaminerDetails.replace(/:oid/, examinerDetails.oid),
      detailsToSubmit,
    );
    yield put(acceptExaminerDetailsUpsert());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectExaminerDetailsUpsert());
  }
}

export function* watchExaminerDetailsUpsert() {
  yield takeLatest(
    startExaminerDetailsUpsert.type,
    startExaminerDetailsUpsertSaga,
  );
}
