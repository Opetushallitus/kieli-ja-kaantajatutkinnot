import { all } from 'redux-saga/effects';

import { watchEvaluationOrder } from 'redux/sagas/evaluationOrder';
import { watchEvaluationPeriods } from 'redux/sagas/evaluationPeriod';
import { watchExamSessions } from 'redux/sagas/examSession';
import { watchPublicIdentification } from 'redux/sagas/publicIdentification';

export default function* rootSaga() {
  yield all([
    watchExamSessions(),
    watchEvaluationOrder(),
    watchEvaluationPeriods(),
    watchPublicIdentification(),
  ]);
}
