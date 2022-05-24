import { all } from 'redux-saga/effects';

import { watchFetchClerkInterpreters } from 'redux/sagas/clerkInterpreter';
import { watchFetchPublicInterpreters } from 'redux/sagas/publicInterpreter';

export default function* rootSaga() {
  yield all([watchFetchPublicInterpreters(), watchFetchClerkInterpreters()]);
}
