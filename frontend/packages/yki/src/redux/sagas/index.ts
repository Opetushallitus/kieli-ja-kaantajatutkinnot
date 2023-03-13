import { all } from 'redux-saga/effects';

import { watchEvaluationPeriods } from 'redux/sagas/evaluationPeriod';
import { watchExamSessions } from 'redux/sagas/examSession';

export default function* rootSaga() {
  yield all([watchExamSessions(), watchEvaluationPeriods()]);
}
