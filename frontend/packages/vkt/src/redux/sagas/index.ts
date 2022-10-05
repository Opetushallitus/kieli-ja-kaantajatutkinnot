import { all } from 'redux-saga/effects';

import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';

export default function* rootSaga() {
  yield all([watchListExamEvents(), watchClerkUser(), watchPublicExamEvents()]);
}
