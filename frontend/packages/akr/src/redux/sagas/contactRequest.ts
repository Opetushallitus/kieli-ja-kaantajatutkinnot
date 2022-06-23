import { Action } from 'redux';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  CONTACT_REQUEST_ERROR,
  CONTACT_REQUEST_SEND,
  CONTACT_REQUEST_STEP_INCREASE,
  CONTACT_REQUEST_SUCCESS,
  isContactRequestSendAction,
} from 'redux/actionTypes/contactRequest';
import { PUBLIC_TRANSLATOR_EMPTY_SELECTIONS } from 'redux/actionTypes/publicTranslator';

export function* sendContactRequest(action: Action) {
  if (isContactRequestSendAction(action)) {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      languagePair,
      translatorIds,
      message,
    } = action.request;
    try {
      yield call(
        axiosInstance.post,
        APIEndpoints.ContactRequest,
        JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
          translatorIds,
          message: message.trim(),
          fromLang: languagePair.from,
          toLang: languagePair.to,
        })
      );
      yield put({ type: CONTACT_REQUEST_SUCCESS });
      yield put({ type: CONTACT_REQUEST_STEP_INCREASE });
      yield put({ type: PUBLIC_TRANSLATOR_EMPTY_SELECTIONS });
    } catch (error) {
      yield put({ type: CONTACT_REQUEST_ERROR, error });
    }
  }
}

export function* watchContactRequest() {
  yield takeLatest(CONTACT_REQUEST_SEND, sendContactRequest);
}
