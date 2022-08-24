import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { Authorisation } from 'interfaces/authorisation';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisation,
} from 'redux/reducers/authorisation';
import { loadClerkTranslatorOverview } from 'redux/reducers/clerkTranslatorOverview';
import { SerializationUtils } from 'utils/serialization';

// TODO Show success toast when new authorisation is added -> handle inside page
// t('akr.component.newAuthorisation.toasts.success')

function* addAuthorisationSaga(action: PayloadAction<Authorisation>) {
  try {
    const { translatorId } = action.payload;
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.payload)
    );
    yield put(addingAuthorisationSucceeded());
    yield put(loadClerkTranslatorOverview(translatorId as number));
  } catch (error) {
    const t = translateOutsideComponent();
    yield put(setAPIError(t('akr.component.newAuthorisation.toasts.error')));
    yield put(rejectAuthorisation());
  }
}

export function* watchAddAuthorisation() {
  yield takeLatest(addAuthorisation.type, addAuthorisationSaga);
}
