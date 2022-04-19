import { call, put, takeLatest } from 'redux-saga/effects';
import { Action } from 'redux';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  CONTACT_REQUEST_ERROR,
  CONTACT_REQUEST_SEND,
  CONTACT_REQUEST_SUCCESS,
  CONTACT_REQUEST_STEP_INCREASE,
  isContactRequestSendAction,
} from 'redux/actionTypes/contactRequest';
import { Utils } from 'utils';
import { Severity, Variant } from 'enums/app';
import {
  NOTIFIER_ACTION_DO_NOTHING,
  NOTIFIER_DIALOG_ADD,
} from 'redux/actionTypes/notifier';
import { translateOutsideComponent } from 'configs/i18n';
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
          firstName,
          lastName,
          email,
          phoneNumber,
          translatorIds,
          message,
          fromLang: languagePair.from,
          toLang: languagePair.to,
        })
      );
      yield put({ type: CONTACT_REQUEST_SUCCESS });
      yield put({ type: CONTACT_REQUEST_STEP_INCREASE });
      yield put({ type: PUBLIC_TRANSLATOR_EMPTY_SELECTIONS });
    } catch (error) {
      const t = translateOutsideComponent();
      const tPrefix = 'akt.component.contactRequestForm.errorDialog';
      const notifier = Utils.createNotifierDialog(
        t(`${tPrefix}.title`),
        Severity.Error,
        t(`${tPrefix}.description`),
        [
          {
            title: t(`${tPrefix}.back`),
            variant: Variant.Contained,
            action: NOTIFIER_ACTION_DO_NOTHING,
          },
        ]
      );

      yield put({ type: CONTACT_REQUEST_ERROR });
      yield put({ type: NOTIFIER_DIALOG_ADD, notifier });
    }
  }
}

export function* watchContactRequest() {
  yield takeLatest(CONTACT_REQUEST_SEND, sendContactRequest);
}
