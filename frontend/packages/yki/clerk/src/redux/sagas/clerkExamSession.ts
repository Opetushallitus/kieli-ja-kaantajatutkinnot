import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkExamSessionResponse } from 'interfaces/clerkExamSession';
import {
  acceptSaveExamSession,
  ClerkExamSessionEditForm,
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  rejectSaveExamSession,
  saveExamSession,
  storeExamSessionDetails,
} from 'redux/reducers/clerkExamSession';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkExamSessionDetailsSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse<ClerkExamSessionResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExamSession.replace(/:id$/, action.payload),
    );
    const clerkExamSession =
      SerializationUtils.deserializeClerkExamSessionResponse(response.data);

    yield put(storeExamSessionDetails(clerkExamSession));
  } catch (error) {
    yield put(rejectExamSessionDetails());
  }
}

function* saveExamSessionSaga(
  action: PayloadAction<{
    examSessionId: number;
    form: ClerkExamSessionEditForm;
  }>,
) {
  const { examSessionId, form } = action.payload;
  try {
    const response: AxiosResponse<ClerkExamSessionResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkExamSession.replace(/:id$/, `${examSessionId}`),
      {
        maxParticipants: Number(form.maxParticipants),
        streetAddress: form.streetAddress,
        zip: form.postalCode,
        postOffice: form.city,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhoneNumber: form.contactPhoneNumber,
      },
    );
    const clerkExamSession =
      SerializationUtils.deserializeClerkExamSessionResponse(response.data);

    yield put(acceptSaveExamSession(clerkExamSession));
  } catch (error) {
    yield put(rejectSaveExamSession());
  }
}

export function* watchClerkExamSession() {
  yield takeLatest(
    loadClerkExamSessionDetails.type,
    loadClerkExamSessionDetailsSaga,
  );
  yield takeLatest(saveExamSession.type, saveExamSessionSaga);
}
