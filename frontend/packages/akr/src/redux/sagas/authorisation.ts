import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { Severity } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { Authorisation } from 'interfaces/authorisation';
import {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisation,
} from 'redux/reducers/authorisation';
import { loadClerkTranslatorOverview } from 'redux/reducers/clerkTranslatorOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* showSuccessToastOnAdd() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Success,
    t('akr.component.newAuthorisation.toasts.success')
  );
  yield put(showNotifierToast(notifier));
}

// TODO: other authorisation actions currently under clerkTranslatorOverview
export function* addAuthorisationSaga(action: PayloadAction<Authorisation>) {
  try {
    const { translatorId } = action.payload;
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.payload)
    );
    yield put(addingAuthorisationSucceeded());
    yield call(showSuccessToastOnAdd);
    yield put(loadClerkTranslatorOverview(translatorId as number));
  } catch (error) {
    yield put(rejectAuthorisation());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchAddAuthorisation() {
  yield takeLatest(addAuthorisation.type, addAuthorisationSaga);
}
