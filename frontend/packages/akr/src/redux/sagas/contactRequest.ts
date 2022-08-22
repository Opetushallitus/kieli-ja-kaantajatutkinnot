import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicUIViews } from 'enums/app';
import { ContactRequest } from 'interfaces/contactRequest';
import {
  concludeContactRequest,
  increaseContactRequestStep,
  rejectContactRequest,
  sendContactRequest,
  sendingContactRequestSucceeded,
} from 'redux/reducers/contactRequest';
import { deselectAllPublicTranslators } from 'redux/reducers/publicTranslator';
import { setPublicUIView } from 'redux/reducers/publicUIView';

function* concludeContactRequestSaga() {
  yield put(deselectAllPublicTranslators());
  yield put(setPublicUIView(PublicUIViews.PublicTranslatorListing));
}

function* sendContactRequestSaga(action: PayloadAction<ContactRequest>) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    languagePair,
    translatorIds,
    message,
  } = action.payload;
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
    yield put(sendingContactRequestSucceeded());
    yield put(increaseContactRequestStep());
    yield put(deselectAllPublicTranslators());
  } catch (error) {
    yield put(rejectContactRequest(error as AxiosError));
  }
}

export function* watchContactRequest() {
  yield takeLatest(sendContactRequest.type, sendContactRequestSaga);
  yield takeLatest(concludeContactRequest.type, concludeContactRequestSaga);
}
