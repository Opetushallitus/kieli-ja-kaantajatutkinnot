import { all } from 'redux-saga/effects';

import { watchFetchClerkInterpreters } from 'redux/sagas/clerkInterpreter';
import { watchFetchClerkInterpreterOverview } from 'redux/sagas/clerkInterpreterOverview';
import { watchFetchPublicInterpreters } from 'redux/sagas/publicInterpreter';
import { watchAddQualification } from 'redux/sagas/qualification';

export default function* rootSaga() {
  yield all([
    watchFetchPublicInterpreters(),
    watchFetchClerkInterpreters(),
    watchFetchClerkInterpreterOverview(),
    watchAddQualification(),
  ]);
}
