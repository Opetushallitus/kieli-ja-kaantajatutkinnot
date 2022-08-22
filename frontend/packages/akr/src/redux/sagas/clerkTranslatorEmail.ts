import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { AxiosError } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
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
    yield put(rejectClerkTranslatorEmail(error as AxiosError));
  }
}

export function* watchClerkTranslatorEmail() {
  yield takeLatest(sendClerkTranslatorEmail.type, sendClerkTranslatorEmailSaga);
}
