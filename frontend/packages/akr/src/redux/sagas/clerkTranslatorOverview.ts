import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { Authorisation } from 'interfaces/authorisation';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import {
  loadClerkTranslatorOverview,
  rejectAuthorisationPublishPermissionUpdate,
  rejectAuthorisationRemove,
  rejectClerkTranslatorDetailsUpdate,
  rejectClerkTranslatorOverview,
  removeAuthorisation,
  removingAuthorisationSucceeded,
  storeClerkTranslatorOverview,
  updateAuthorisationPublishPermission,
  updateClerkTranslatorDetails,
  updatingAuthorisationPublishPermissionSucceeded,
  updatingClerkTranslatorDetailsSucceeded,
} from 'redux/reducers/clerkTranslatorOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { updateClerkTranslatorsState } from 'redux/sagas/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkTranslatorOverviewSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkTranslator}/${action.payload}`
    );

    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(storeClerkTranslatorOverview(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorOverview());
  }
}

function updateClerkTranslators(
  translators: Array<ClerkTranslator>,
  translator: ClerkTranslator
) {
  const updatedTranslators = [...translators];
  const translatorIdx = updatedTranslators.findIndex(
    (t: ClerkTranslator) => t.id === translator.id
  );

  updatedTranslators.splice(translatorIdx, 1, translator);

  return updatedTranslators;
}

function* updateTranslatorDetails(action: PayloadAction<ClerkTranslator>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkTranslator,
      SerializationUtils.serializeClerkTranslator(action.payload)
    );
    const { translators } = yield select(clerkTranslatorsSelector);
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    const updatedTranslators = updateClerkTranslators(translators, translator);
    yield updateClerkTranslatorsState(updatedTranslators);

    yield put(updatingClerkTranslatorDetailsSucceeded(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorDetailsUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
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
    const { translators } = yield select(clerkTranslatorsSelector);
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    const updatedTranslators = updateClerkTranslators(translators, translator);
    yield updateClerkTranslatorsState(updatedTranslators);

    yield put(updatingAuthorisationPublishPermissionSucceeded(translator));
  } catch (error) {
    yield put(rejectAuthorisationPublishPermissionUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* removeAuthorisationSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.delete,
      `${APIEndpoints.Authorisation}/${action.payload}`
    );
    const { translators } = yield select(clerkTranslatorsSelector);
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    const updatedTranslators = updateClerkTranslators(translators, translator);
    yield updateClerkTranslatorsState(updatedTranslators);

    yield put(removingAuthorisationSucceeded(translator));
  } catch (error) {
    yield put(rejectAuthorisationRemove());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchClerkTranslatorOverview() {
  yield takeLatest(updateClerkTranslatorDetails.type, updateTranslatorDetails);
  yield takeLatest(
    loadClerkTranslatorOverview.type,
    loadClerkTranslatorOverviewSaga
  );
  yield takeLatest(
    updateAuthorisationPublishPermission.type,
    updateAuthorisationPublishPermissionSaga
  );
  yield takeLatest(removeAuthorisation.type, removeAuthorisationSaga);
}
