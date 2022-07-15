import { call, put, select } from '@redux-saga/core/effects';
import { Severity } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  CLERK_TRANSLATOR_EMAIL_CANCEL,
  CLERK_TRANSLATOR_EMAIL_ERROR,
  CLERK_TRANSLATOR_EMAIL_SUCCESS,
} from 'redux/actionTypes/clerkTranslatorEmail';
import { NOTIFIER_TOAST_ADD } from 'redux/actionTypes/notifier';
import { selectClerkTranslatorEmail } from 'redux/selectors/clerkTranslatorEmail';
import { NotifierUtils } from 'utils/notifier';

export function* cancel() {
  yield put({
    type: CLERK_TRANSLATOR_EMAIL_CANCEL,
  });
}

function* showSuccessToast() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Success,
    t('akr.pages.clerkSendEmailPage.toasts.success')
  );
  yield put({ type: NOTIFIER_TOAST_ADD, notifier });
}

function* showErrorToast() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Error,
    t('akr.pages.clerkSendEmailPage.toasts.error')
  );
  yield put({ type: NOTIFIER_TOAST_ADD, notifier });
}

export function* sendEmail() {
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
    yield put({ type: CLERK_TRANSLATOR_EMAIL_SUCCESS });
    yield call(showSuccessToast);
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_EMAIL_ERROR });
    yield call(showErrorToast);
  }
}
