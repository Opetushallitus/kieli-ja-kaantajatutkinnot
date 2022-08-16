import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { Severity } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  rejectClerkTranslatorEmail,
  sendClerkTranslatorEmail,
  sendingClerkTranslatorEmailSucceeded,
} from 'redux/reducers/clerkTranslatorEmail';
import { showNotifierToast } from 'redux/reducers/notifier';
import { selectClerkTranslatorEmail } from 'redux/selectors/clerkTranslatorEmail';
import { NotifierUtils } from 'utils/notifier';

function* showSuccessToast() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Success,
    t('akr.pages.clerkSendEmailPage.toasts.success')
  );
  yield put(showNotifierToast(notifier));
}

function* showErrorToast() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Error,
    t('akr.pages.clerkSendEmailPage.toasts.error')
  );
  yield put(showNotifierToast(notifier));
}

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
    yield call(showSuccessToast);
  } catch (error) {
    yield put(rejectClerkTranslatorEmail());
    yield call(showErrorToast);
  }
}

export function* watchClerkTranslatorEmail() {
  yield takeLatest(sendClerkTranslatorEmail.type, sendClerkTranslatorEmailSaga);
}
