import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  acceptEmailLinkOrder,
  EmailLinkOrder,
  rejectEmailLinkOrder,
  sendEmailLinkOrder,
} from 'redux/reducers/publicIdentification';
import { SerializationUtils } from 'utils/serialization';

function* sendEmailLinkOrderSaga(action: PayloadAction<EmailLinkOrder>) {
  try {
    const { email, examSessionId } = action.payload;
    const lang = getCurrentLang();

    yield call(
      axiosInstance.post,
      APIEndpoints.LoginLink,
      JSON.stringify({ email, exam_session_id: examSessionId }),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
          'use-yki-ui': true,
        },
      }
    );
    yield put(acceptEmailLinkOrder());
  } catch (error) {
    yield put(rejectEmailLinkOrder());
  }
}

export function* watchPublicIdentification() {
  yield takeLatest(sendEmailLinkOrder.type, sendEmailLinkOrderSaga);
}
