import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkExamSessionResponse } from 'interfaces/clerkExamSession';
import {
  acceptCancelRegistration,
  acceptCreateExamSession,
  acceptRelocateRegistration,
  acceptSaveExamSession,
  cancelOrganizerRegistration,
  cancelRegistration,
  ClerkExamSessionCreateForm,
  ClerkExamSessionEditForm,
  createExamSession,
  loadClerkExamSessionDetails,
  loadRelocateExamSessions,
  rejectCancelRegistration,
  rejectCreateExamSession,
  rejectExamSessionDetails,
  rejectRelocateExamSessions,
  rejectRelocateRegistration,
  rejectSaveExamSession,
  relocateRegistration,
  saveExamSession,
  storeExamSessionDetails,
  storeRelocateExamSessions,
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
        language: form.language,
        level: form.level,
        maxParticipantsTotal: Number(form.maxParticipantsTotal),
        maxParticipantsReadListen:
          Number(form.maxParticipantsReadListen) || null,
        maxParticipantsSpeakWrite:
          Number(form.maxParticipantsSpeakWrite) || null,
        location: form.location,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhoneNumber: form.contactPhoneNumber,
        startTime: form.startTime,
        startTimeReadListen: form.startTimeReadListen || null,
        startTimeSpeakWrite: form.startTimeSpeakWrite || null,
        officeOid: form.officeOid,
      },
    );
    const clerkExamSession =
      SerializationUtils.deserializeClerkExamSessionResponse(response.data);

    yield put(acceptSaveExamSession(clerkExamSession));
  } catch (error) {
    yield put(rejectSaveExamSession());
  }
}

function* loadRelocateExamSessionsSaga(
  action: PayloadAction<{ language: string; level: string }>,
) {
  try {
    const { language, level } = action.payload;
    const response: AxiosResponse<ClerkExamSessionResponse[]> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkExamSessions,
      { params: { language, level } },
    );

    yield put(storeRelocateExamSessions(response.data));
  } catch (error) {
    yield put(rejectRelocateExamSessions());
  }
}

function* relocateRegistrationSaga(
  action: PayloadAction<{
    registrationId: number;
    targetExamSessionId: number;
    currentExamSessionId: number;
  }>,
) {
  const { registrationId, targetExamSessionId, currentExamSessionId } =
    action.payload;
  try {
    yield call(
      axiosInstance.put,
      APIEndpoints.ClerkRegistrationMove.replace(
        ':registrationId',
        String(registrationId),
      ).replace(':targetExamSessionId', String(targetExamSessionId)),
    );

    yield put(acceptRelocateRegistration());
    yield put(loadClerkExamSessionDetails(currentExamSessionId));
  } catch (error) {
    yield put(rejectRelocateRegistration());
  }
}

function* cancelOrganizerRegistrationSaga(
  action: PayloadAction<{
    registrationId: number;
    currentExamSessionId: number;
    organizerOid: string;
  }>,
) {
  const { registrationId, currentExamSessionId, organizerOid } = action.payload;
  try {
    yield call(
      axiosInstance.delete,
      APIEndpoints.OrganizerRegistrationCancel.replace(
        ':oid',
        organizerOid,
      ).replace(':registrationId', String(registrationId)),
    );

    yield put(acceptCancelRegistration());
    yield put(loadClerkExamSessionDetails(currentExamSessionId));
  } catch (error) {
    yield put(rejectCancelRegistration());
  }
}

function* cancelRegistrationSaga(
  action: PayloadAction<{
    registrationId: number;
    currentExamSessionId: number;
  }>,
) {
  const { registrationId, currentExamSessionId } = action.payload;
  try {
    yield call(
      axiosInstance.delete,
      APIEndpoints.ClerkRegistrationCancel.replace(
        ':registrationId',
        String(registrationId),
      ),
    );

    yield put(acceptCancelRegistration());
    yield put(loadClerkExamSessionDetails(currentExamSessionId));
  } catch (error) {
    yield put(rejectCancelRegistration());
  }
}

function* createExamSessionSaga(
  action: PayloadAction<ClerkExamSessionCreateForm>,
) {
  const form = action.payload;
  try {
    yield call(axiosInstance.post, APIEndpoints.ClerkExamSessions, {
      organizerOid: form.organizerOid,
      examDateId: Number(form.examDateId),
      language: form.language,
      level: form.level,
      type: form.type,
      maxParticipantsTotal: Number(form.maxParticipantsTotal),
      maxParticipantsReadListen: Number(form.maxParticipantsReadListen) || null,
      maxParticipantsSpeakWrite: Number(form.maxParticipantsSpeakWrite) || null,
      startTime: form.startTime,
      startTimeReadListen: form.startTimeReadListen || null,
      startTimeSpeakWrite: form.startTimeSpeakWrite || null,
      location: form.location,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhoneNumber: form.contactPhoneNumber,
      officeOid: form.officeOid,
    });

    yield put(acceptCreateExamSession());
  } catch (error) {
    yield put(rejectCreateExamSession());
  }
}

export function* watchClerkExamSession() {
  yield takeLatest(
    loadClerkExamSessionDetails.type,
    loadClerkExamSessionDetailsSaga,
  );
  yield takeLatest(saveExamSession.type, saveExamSessionSaga);
  yield takeLatest(loadRelocateExamSessions.type, loadRelocateExamSessionsSaga);
  yield takeLatest(relocateRegistration.type, relocateRegistrationSaga);
  yield takeLatest(cancelRegistration.type, cancelRegistrationSaga);
  yield takeLatest(
    cancelOrganizerRegistration.type,
    cancelOrganizerRegistrationSaga,
  );
  yield takeLatest(createExamSession.type, createExamSessionSaga);
}
