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
import { storeExaminerExamEventOverview } from 'redux/reducers/examinerExamEventOverview';
import {
  acceptExaminerExamEventUpsert,
  rejectExaminerExamEventUpsert,
  startExaminerExamEventUpsert,
  updateExaminerExamEventUpsert,
} from 'redux/reducers/examinerExamEventUpsert';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { examinerExamEventUpsertSelector } from 'redux/selectors/examinerExamEventUpsert';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* startExaminerExamEventUpsertSaga() {
  try {
    const { examEvent }: { examEvent: ExaminerExamEventUpsert } = yield select(
      examinerExamEventUpsertSelector,
    );
    const { examiner }: { examiner: ExaminerDetails } = yield select(
      examinerDetailsSelector,
    );

    const { id, ...detailsToSubmit } = examEvent;
    const upsertEndpoint = id
      ? `${APIEndpoints.ExaminerExamEvent.replace(/:oid/, examiner.oid)}/${id}`
      : APIEndpoints.ExaminerExamEvent.replace(/:oid/, examiner.oid);
    const response: AxiosResponse<ExaminerExamEventResponse> = yield call(
      axiosInstance.post,
      upsertEndpoint,
      detailsToSubmit,
    );
    // Record id so we can transfer user to exam event details page
    yield put(updateExaminerExamEventUpsert({ id: response.data.id }));
    // Update stored exam event details
    const updatedExamEvent = SerializationUtils.deserializeExaminerExamEvent(
      response.data,
    );
    yield put(storeExaminerExamEventOverview(updatedExamEvent));
    yield put(acceptExaminerExamEventUpsert());
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
