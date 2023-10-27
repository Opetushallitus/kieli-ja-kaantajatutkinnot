import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import { setAPIError } from 'redux/reducers/APIError';
import { upsertClerkTranslator } from 'redux/reducers/clerkTranslator';
import {
  loadClerkTranslatorOverview,
  rejectClerkTranslatorDetailsUpdate,
  rejectClerkTranslatorOverview,
  storeClerkTranslatorOverview,
  updateClerkTranslatorDetails,
  updatingClerkTranslatorDetailsSucceeded,
} from 'redux/reducers/clerkTranslatorOverview';
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
    const t = translateOutsideComponent();
    yield put(
      setAPIError(t('akr.component.clerkTranslatorOverview.toasts.notFound'))
    );
    yield put(rejectClerkTranslatorOverview());
  }
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

    yield put(upsertClerkTranslator(translator));
    yield put(updatingClerkTranslatorDetailsSucceeded(translator));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkTranslatorDetailsUpdate());
  }
}

export function* watchClerkTranslatorOverview() {
  yield takeLatest(
    loadClerkTranslatorOverview.type,
    loadClerkTranslatorOverviewSaga
  );
  yield takeLatest(updateClerkTranslatorDetails.type, updateTranslatorDetails);
}
