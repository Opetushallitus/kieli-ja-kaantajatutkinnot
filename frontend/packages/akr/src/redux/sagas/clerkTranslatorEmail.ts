import { call, put, select } from '@redux-saga/core/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  CLERK_TRANSLATOR_EMAIL_CANCEL,
  CLERK_TRANSLATOR_EMAIL_ERROR,
  CLERK_TRANSLATOR_EMAIL_SUCCESS,
} from 'redux/actionTypes/clerkTranslatorEmail';
import { selectClerkTranslatorEmail } from 'redux/selectors/clerkTranslatorEmail';

export function* cancel() {
  yield put({
    type: CLERK_TRANSLATOR_EMAIL_CANCEL,
  });
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
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_EMAIL_ERROR });
  }
}
