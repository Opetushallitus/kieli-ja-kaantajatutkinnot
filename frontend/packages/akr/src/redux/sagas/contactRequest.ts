import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { Severity, Variant } from 'shared/enums';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
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
import { showNotifierDialog } from 'redux/reducers/notifier';
import { emptyPublicTranslatorSelections } from 'redux/reducers/publicTranslator';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { NotifierUtils } from 'utils/notifier';

export function* resetTranslatorSelectionsAndRedirect() {
  yield put(emptyPublicTranslatorSelections());
  yield put(setPublicUIView(PublicUIViews.PublicTranslatorListing));
}

export function* insertContactRequest(action: PayloadAction<ContactRequest>) {
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
    yield put(emptyPublicTranslatorSelections());
  } catch (error) {
    const t = translateOutsideComponent();
    const tPrefix = 'akr.component.contactRequestForm.errorDialog';
    const notifier = NotifierUtils.createNotifierDialog(
      t(`${tPrefix}.title`),
      Severity.Error,
      t(`${tPrefix}.description`),
      [
        {
          title: t(`${tPrefix}.back`),
          variant: Variant.Contained,
          action: () => undefined,
        },
      ]
    );

    yield put(rejectContactRequest());
    yield put(showNotifierDialog(notifier));
  }
}

export function* watchContactRequest() {
  yield takeLatest(sendContactRequest.type, insertContactRequest);
  yield takeLatest(
    concludeContactRequest.type,
    resetTranslatorSelectionsAndRedirect
  );
}
