import { all } from 'redux-saga/effects';

import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';

export default function* rootSaga() {
  yield all([watchPublicExamEvents()]);
}
