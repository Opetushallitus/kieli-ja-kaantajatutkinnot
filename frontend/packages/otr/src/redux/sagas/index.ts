import { all } from 'redux-saga/effects';

import { watchFetchPublicInterpreters } from 'redux/sagas/publicInterpreter';

export default function* rootSaga() {
  yield all([watchFetchPublicInterpreters()]);
}
