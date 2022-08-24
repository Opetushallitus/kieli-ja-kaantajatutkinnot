import { call, put, select, takeLatest } from '@redux-saga/core/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { setAPIError } from 'redux/reducers/APIError';
import {
  rejectClerkTranslatorEmail,
  sendClerkTranslatorEmail,
  sendingClerkTranslatorEmailSucceeded,
} from 'redux/reducers/clerkTranslatorEmail';
import { selectClerkTranslatorEmail } from 'redux/selectors/clerkTranslatorEmail';

function* sendClerkTranslatorEmailSaga() {
  const { email, recipients }: ReturnType<typeof selectClerkTranslatorEmail> =
    yield select(selectClerkTranslatorEmail);
  try {
    yield call(
      axiosInstance.post,
      APIEndpoints.InformalClerkTranslatorEmail,
      JSON.stringify({
        subject: email.subject.trim(),
        body: email.body.trim(),
        translatorIds: recipients,
      })
    );
    yield put(sendingClerkTranslatorEmailSucceeded());
  } catch (error) {
    const t = translateOutsideComponent();
    yield put(setAPIError(t('akr.pages.clerkSendEmailPage.toasts.error')));
    yield put(rejectClerkTranslatorEmail());
  }
}

export function* watchClerkTranslatorEmail() {
  yield takeLatest(sendClerkTranslatorEmail.type, sendClerkTranslatorEmailSaga);
}
