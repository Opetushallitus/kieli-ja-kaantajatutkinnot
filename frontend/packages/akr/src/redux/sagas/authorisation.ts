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
  rejectAuthorisationPublishPermissionUpdate,
  rejectAuthorisationRemove,
  removeAuthorisation,
  removingAuthorisationSucceeded,
  updateAuthorisationPublishPermission,
  updatingAuthorisationPublishPermissionSucceeded,
} from 'redux/reducers/authorisation';
import { upsertClerkTranslator } from 'redux/reducers/clerkTranslator';
import { setSelectedTranslator } from 'redux/reducers/clerkTranslatorOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* addAuthorisationSaga(action: PayloadAction<Authorisation>) {
  try {
    const { translatorId } = action.payload;
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.payload)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(setSelectedTranslator(translator));
    yield put(addingAuthorisationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationAdd());
  }
}

function* updateAuthorisationPublishPermissionSaga(
  action: PayloadAction<Authorisation>
) {
  const { id, version, permissionToPublish } = action.payload;
  const requestBody = {
    id,
    version,
    permissionToPublish,
  };

  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.AuthorisationPublishPermission,
      requestBody
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(setSelectedTranslator(translator));
    yield put(updatingAuthorisationPublishPermissionSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationPublishPermissionUpdate());
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
    yield put(setSelectedTranslator(translator));
    yield put(removingAuthorisationSucceeded());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectAuthorisationRemove());
  }
}

export function* watchAuthorisations() {
  yield takeLatest(addAuthorisation, addAuthorisationSaga);
  yield takeLatest(
    updateAuthorisationPublishPermission,
    updateAuthorisationPublishPermissionSaga
  );
  yield takeLatest(removeAuthorisation, removeAuthorisationSaga);
}
