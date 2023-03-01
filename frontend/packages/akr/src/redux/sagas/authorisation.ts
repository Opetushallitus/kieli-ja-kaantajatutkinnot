import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisationAdd,
  rejectAuthorisationRemove,
  rejectAuthorisationUpdate,
  removeAuthorisation,
  removingAuthorisationSucceeded,
  updateAuthorisation,
  updatingAuthorisationSucceeded,
} from 'redux/reducers/authorisation';
import { upsertClerkTranslator } from 'redux/reducers/clerkTranslator';
import { setClerkTranslatorOverviewTranslator } from 'redux/reducers/clerkTranslatorOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* addAuthorisationSaga(
  action: PayloadAction<{
    authorisation: Authorisation;
    translatorId: number;
  }>
) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${action.payload.translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.payload.authorisation)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(setClerkTranslatorOverviewTranslator(translator));
    yield put(addingAuthorisationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationAdd());
  }
}

function* updateAuthorisationSaga(action: PayloadAction<Authorisation>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.Authorisation,
      SerializationUtils.serializeAuthorisation(action.payload)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(setClerkTranslatorOverviewTranslator(translator));
    yield put(updatingAuthorisationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationUpdate());
  }
}

function* removeAuthorisationSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.delete,
      `${APIEndpoints.Authorisation}/${action.payload}`
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(setClerkTranslatorOverviewTranslator(translator));
    yield put(removingAuthorisationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationRemove());
  }
}

export function* watchAuthorisations() {
  yield takeLatest(addAuthorisation.type, addAuthorisationSaga);
  yield takeLatest(updateAuthorisation.type, updateAuthorisationSaga);
  yield takeLatest(removeAuthorisation.type, removeAuthorisationSaga);
}
