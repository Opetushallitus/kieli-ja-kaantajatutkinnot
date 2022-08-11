import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import { storeClerkTranslators } from 'redux/reducers/clerkTranslator';
import {
  deleteClerkTranslatorAuthorisation,
  deletingClerkTranslatorAuthorisationSucceeded,
  loadClerkTranslatorOverviewWithId,
  loadingClerkTranslatorOverview,
  loadingClerkTranslatorOverviewSucceeded,
  rejectClerkTranslatorAuthorisationDelete,
  rejectClerkTranslatorDetailsUpdate,
  rejectClerkTranslatorOverview,
  rejectClerkTranslatorPublishPermissionUpdate,
  updateClerkTranslatorDetails,
  updateClerkTranslatorPublishPermission,
  updatingCLerkTranslatorDetailsSucceeded,
  updatingClerkTranslatorPublishPermissionSucceeded,
} from 'redux/reducers/clerkTranslatorOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* fetchClerkTranslatorOverview(action: PayloadAction<number>) {
  try {
    yield put(loadingClerkTranslatorOverview());
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkTranslator}/${action.payload}`
    );

    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(loadingClerkTranslatorOverviewSucceeded(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorOverview());
  }
}

export function* updateClerkTranslatorsState(translator: ClerkTranslator) {
  const { translators, langs, meetingDates, examinationDates } = yield select(
    clerkTranslatorsSelector
  );
  const translatorIdx = translators.findIndex(
    (t: ClerkTranslator) => t.id === translator.id
  );

  const updatedTranslators = [...translators].splice(
    translatorIdx,
    1,
    translator
  );

  yield put(
    storeClerkTranslators({
      translators: updatedTranslators,
      langs,
      meetingDates,
      examinationDates,
    })
  );
}

function* updateTranslatorDetails(action: PayloadAction<ClerkTranslator>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkTranslator,
      SerializationUtils.serializeClerkTranslator(action.payload)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield updateClerkTranslatorsState(translator);

    yield put(updatingCLerkTranslatorDetailsSucceeded(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorDetailsUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* updateAuthorisationPublishPermission(
  action: PayloadAction<{
    id: number;
    version: number;
    permissionToPublish: boolean;
  }>
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
    yield updateClerkTranslatorsState(translator);

    yield put(updatingClerkTranslatorPublishPermissionSucceeded(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorPublishPermissionUpdate());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

function* deleteAuthorisation(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.delete,
      `${APIEndpoints.Authorisation}/${action.payload}`
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield updateClerkTranslatorsState(translator);

    yield put(deletingClerkTranslatorAuthorisationSucceeded(translator));
  } catch (error) {
    yield put(rejectClerkTranslatorAuthorisationDelete());
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
    loadClerkTranslatorOverviewWithId.type,
    fetchClerkTranslatorOverview
  );
  yield takeLatest(
    updateClerkTranslatorPublishPermission.type,
    updateAuthorisationPublishPermission
  );
  yield takeLatest(
    deleteClerkTranslatorAuthorisation.type,
    deleteAuthorisation
  );
}
