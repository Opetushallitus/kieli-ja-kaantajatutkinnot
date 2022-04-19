import { put, takeLatest } from 'redux-saga/effects';

import {
  NOTIFIER_ACTION_CONTACT_REQUEST_RESET,
  NOTIFIER_ACTION_CONTACT_REQUEST_EMPTY,
} from 'redux/actionTypes/notifier';
import { UIStates } from 'enums/app';
import { DISPLAY_UI_STATE } from 'redux/actionTypes/navigation';
import {
  CONTACT_REQUEST_RESET,
  CONTACT_REQUEST_RESET_REDIRECT,
} from 'redux/actionTypes/contactRequest';

export function* resetContactRequest() {
  yield put({ type: CONTACT_REQUEST_RESET });
  yield put({
    type: DISPLAY_UI_STATE,
    state: UIStates.PublicTranslatorListing,
  });
}

export function* emtyContactRequestState() {
  yield put({ type: CONTACT_REQUEST_RESET });
}

export function* watchContactRequestNotifier() {
  yield takeLatest(
    [NOTIFIER_ACTION_CONTACT_REQUEST_RESET, CONTACT_REQUEST_RESET_REDIRECT],
    resetContactRequest
  );
  yield takeLatest(
    NOTIFIER_ACTION_CONTACT_REQUEST_EMPTY,
    emtyContactRequestState
  );
}
