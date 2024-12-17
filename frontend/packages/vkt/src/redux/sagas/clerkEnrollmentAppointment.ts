import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
  ClerkEnrollmentAppointmentHistoryResponse,
  ClerkEnrollmentAppointmentMove,
  ClerkEnrollmentAppointmentResponse,
} from 'interfaces/clerkEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  cancelClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointmentGrades,
  loadClerkEnrollmentAppointmentHistory,
  moveEnrollment,
  moveEnrollmentSucceeded,
  rejectClerkEnrollmentAppointment,
  rejectMoveEnrollment,
  sendClerkEnrollmentAppointmentAuthLink,
  storeCancelClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointment,
  storeClerkEnrollmentAppointmentAuthLink,
  storeClerkEnrollmentAppointmentGrades,
  storeClerkEnrollmentAppointmentGradesUpsert,
  storeClerkEnrollmentAppointmentUpdate,
  storeLoadClerkEnrollmentAppointmentHistory,
  storeUpdateClerkEnrollmentAppointment,
  updateClerkEnrollmentAppointment,
  upsertClerkEnrollmentAppointmentGrades,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* upsertClerkEnrollmentAppointmentGradesSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollmentAppointment;
    grades: ClerkEnrollmentAppointmentGrades;
    oid: string;
  }>,
) {
  const { enrollment, grades, oid } = action.payload;
  const nonEmptyGrades = {
    version: grades.version ?? 0,
    speakingPartialExam:
      grades.speakingPartialExam?.grade !== ''
        ? grades.speakingPartialExam
        : undefined,
    speechComprehensionPartialExam:
      grades.speechComprehensionPartialExam?.grade !== ''
        ? grades.speechComprehensionPartialExam
        : undefined,
    writingPartialExam:
      grades.writingPartialExam?.grade !== ''
        ? grades.writingPartialExam
        : undefined,
    readingComprehensionPartialExam:
      grades.readingComprehensionPartialExam?.grade !== ''
        ? grades.readingComprehensionPartialExam
        : undefined,
  };

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentAppointmentGrades> =
      yield call(
        axiosInstance.put,
        `${APIEndpoints.ExaminerEnrollmentAppointment.replace(/:oid/, oid)}/${
          enrollment.id
        }/grades`,
        nonEmptyGrades,
      );

    yield put(storeClerkEnrollmentAppointmentGradesUpsert(apiResponse.data));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    //yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

function* updateClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    enrollment: ClerkEnrollmentAppointment;
    oid: string;
  }>,
) {
  const { enrollment, oid } = action.payload;

  try {
    const apiResponse: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(
        axiosInstance.put,
        `${APIEndpoints.ExaminerEnrollmentAppointment.replace(/:oid/, oid)}/${
          enrollment.id
        }`,
        SerializationUtils.serializeClerkEnrollmentAppointment(enrollment),
      );
    const updatedEnrollment =
      SerializationUtils.deserializeClerkEnrollmentAppointment(
        apiResponse.data,
      );

    yield put(storeUpdateClerkEnrollmentAppointment());
    yield put(storeClerkEnrollmentAppointmentUpdate(updatedEnrollment));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    //yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

function* loadClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
  }>,
) {
  try {
    const { id, oid } = action.payload;
    const loadUrl = `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
      /:oid/,
      oid,
    )}/${id}`;

    const response: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(axiosInstance.get, loadUrl);
    const enrollment = SerializationUtils.deserializeClerkEnrollmentAppointment(
      response.data,
    );

    yield put(storeClerkEnrollmentAppointment(enrollment));
  } catch (error) {
    yield put(rejectClerkEnrollmentAppointment());
  }
}

function* loadClerkEnrollmentAppointmentGradesSaga(
  action: PayloadAction<{
    enrollmentId: number;
    oid: string;
  }>,
) {
  try {
    const { enrollmentId, oid } = action.payload;
    const loadUrl = `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
      ':oid',
      oid,
    )}/${enrollmentId}/grades`;

    const response: AxiosResponse<ClerkEnrollmentAppointmentGrades> =
      yield call(axiosInstance.get, loadUrl);

    yield put(storeClerkEnrollmentAppointmentGrades(response.data));
  } catch (error) {
    yield put(rejectClerkEnrollmentAppointment());
  }
}

function* sendClerkEnrollmentAppointmentAuthLinkSaga(
  action: PayloadAction<{
    enrollmentId: number;
    oid: string;
  }>,
) {
  try {
    const { enrollmentId, oid } = action.payload;
    const sendUrl = `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
      /:oid/,
      oid,
    )}/${enrollmentId}/sendAuthLink`;

    const response: AxiosResponse<ClerkEnrollmentAppointmentResponse> =
      yield call(axiosInstance.post, sendUrl);
    const enrollment = SerializationUtils.deserializeClerkEnrollmentAppointment(
      response.data,
    );

    yield put(storeClerkEnrollmentAppointmentAuthLink());
    yield put(storeClerkEnrollmentAppointment(enrollment));
  } catch (error) {
    //yield put(rejectClerkEnrollmentAppointment());
  }
}

function* cancelClerkEnrollmentAppointmentSaga(
  action: PayloadAction<{
    id: number;
    oid: string;
  }>,
) {
  try {
    const { id, oid } = action.payload;
    const deleteUrl = `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
      /:oid/,
      oid,
    )}/${id}`;

    yield call(axiosInstance.delete, deleteUrl);

    yield put(storeCancelClerkEnrollmentAppointment());
  } catch (error) {
    //yield put(rejectClerkEnrollmentContactRequest());
  }
}

function* loadClerkEnrollmentAppointmentHistorySaga(
  action: PayloadAction<{
    enrollmentId: number;
    oid: string;
  }>,
) {
  const { enrollmentId, oid } = action.payload;

  try {
    const apiResponse: AxiosResponse<
      Array<ClerkEnrollmentAppointmentHistoryResponse>
    > = yield call(
      axiosInstance.get,
      `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
        /:oid/,
        oid,
      )}/${enrollmentId}/history`,
    );
    const enrollmentHistory = apiResponse.data.map(
      SerializationUtils.deserializeClerkEnrollmentAppointmentHistory,
    );

    yield put(storeLoadClerkEnrollmentAppointmentHistory(enrollmentHistory));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    //yield put(rejectClerkEnrollmentDetailsUpdate());
  }
}

function* moveEnrollmentSaga(
  action: PayloadAction<ClerkEnrollmentAppointmentMove>,
) {
  try {
    const { id, oid } = action.payload;

    yield call(
      axiosInstance.put,
      `${APIEndpoints.ExaminerEnrollmentAppointment.replace(
        /:oid/,
        oid,
      )}/${id}/move`,
      action.payload,
    );

    yield put(moveEnrollmentSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectMoveEnrollment());
  }
}

export function* watchClerkEnrollmentAppointment() {
  yield takeLatest(
    updateClerkEnrollmentAppointment.type,
    updateClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(
    cancelClerkEnrollmentAppointment.type,
    cancelClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(
    loadClerkEnrollmentAppointment.type,
    loadClerkEnrollmentAppointmentSaga,
  );
  yield takeLatest(
    loadClerkEnrollmentAppointmentGrades.type,
    loadClerkEnrollmentAppointmentGradesSaga,
  );
  yield takeLatest(
    sendClerkEnrollmentAppointmentAuthLink.type,
    sendClerkEnrollmentAppointmentAuthLinkSaga,
  );
  yield takeLatest(
    loadClerkEnrollmentAppointmentHistory.type,
    loadClerkEnrollmentAppointmentHistorySaga,
  );
  yield takeLatest(
    upsertClerkEnrollmentAppointmentGrades.type,
    upsertClerkEnrollmentAppointmentGradesSaga,
  );
  yield takeLatest(moveEnrollment, moveEnrollmentSaga);
}
