import { all } from 'redux-saga/effects';

import { watchExamSessions } from 'redux/sagas/examSession';

export default function* rootSaga() {
  yield all([watchExamSessions()]);
}
