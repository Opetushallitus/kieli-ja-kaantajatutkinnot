import { takeLatest } from 'redux-saga/effects';

import { NOTIFIER_ACTION_CLERK_TRANSLATOR_DETAILS_CANCEL_UPDATE } from 'redux/actionTypes/notifier';
import { cancel } from 'redux/sagas/clerkTranslatorOverview';

export function* watchClerkTranslatorDetailsNotifier() {
  yield takeLatest(
    NOTIFIER_ACTION_CLERK_TRANSLATOR_DETAILS_CANCEL_UPDATE,
    cancel
  );
}
