import { put, takeLatest } from 'redux-saga/effects';

import { PublicUIViews } from 'enums/app';
import { setPublicUIView } from 'redux/actions/publicUIView';
import {
  CONTACT_REQUEST_RESET,
  CONTACT_REQUEST_RESET_REDIRECT,
} from 'redux/actionTypes/contactRequest';
import {
  NOTIFIER_ACTION_CONTACT_REQUEST_EMPTY,
  NOTIFIER_ACTION_CONTACT_REQUEST_RESET,
} from 'redux/actionTypes/notifier';
import { PUBLIC_TRANSLATOR_EMPTY_SELECTIONS } from 'redux/actionTypes/publicTranslator';

export function* resetContactRequest() {
  yield put({ type: CONTACT_REQUEST_RESET });
  yield put({ type: PUBLIC_TRANSLATOR_EMPTY_SELECTIONS });
  yield put(setPublicUIView(PublicUIViews.PublicTranslatorListing));
}

export function* emptyContactRequestState() {
  yield put({ type: CONTACT_REQUEST_RESET });
}

export function* watchContactRequestNotifier() {
  yield takeLatest(
    [NOTIFIER_ACTION_CONTACT_REQUEST_RESET, CONTACT_REQUEST_RESET_REDIRECT],
    resetContactRequest
  );
  yield takeLatest(
    NOTIFIER_ACTION_CONTACT_REQUEST_EMPTY,
    emptyContactRequestState
  );
}
