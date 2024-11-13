import { AxiosError, AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import {
  ExaminerExamEventResponse,
  ExaminerExamEventUpsert,
} from 'interfaces/examinerExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptExaminerExamEventUpsert,
  rejectExaminerExamEventUpsert,
  startExaminerExamEventUpsert,
  updateExaminerExamEventUpsert,
} from 'redux/reducers/examinerExamEventUpsert';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { examinerExamEventUpsertSelector } from 'redux/selectors/examinerExamEventUpsert';
import { NotifierUtils } from 'utils/notifier';

function* startExaminerExamEventUpsertSaga() {
  try {
    const { examEvent }: { examEvent: ExaminerExamEventUpsert } = yield select(
      examinerExamEventUpsertSelector,
    );
    const { examiner }: { examiner: ExaminerDetails } = yield select(
      examinerDetailsSelector,
    );

    const { id, ...detailsToSubmit } = examEvent;
    if (id) {
      // TODO Update exam event
    } else {
      // TODO Transform and store created exam event details?
      const response: AxiosResponse<ExaminerExamEventResponse> = yield call(
        axiosInstance.post,
        APIEndpoints.ExaminerExamEvent.replace(/:oid/, examiner.oid),
        detailsToSubmit,
      );
      yield put(updateExaminerExamEventUpsert({ id: response.data.id }));
      yield put(acceptExaminerExamEventUpsert());
    }
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectExaminerExamEventUpsert());
  }
}

export function* watchExaminerExamEventUpsert() {
  yield takeLatest(
    startExaminerExamEventUpsert.type,
    startExaminerExamEventUpsertSaga,
  );
}
