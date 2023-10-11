import { all } from 'redux-saga/effects';

import { watchEvaluationOrder } from 'redux/sagas/evaluationOrder';
import { watchEvaluationPeriods } from 'redux/sagas/evaluationPeriod';
import { watchExamSessions } from 'redux/sagas/examSession';
import { watchNationalities } from 'redux/sagas/nationalities';
import { watchPublicIdentification } from 'redux/sagas/publicIdentification';
import { watchRegistration } from 'redux/sagas/registration';
import { watchReservationRequest } from 'redux/sagas/reservation';
import { watchSession } from 'redux/sagas/session';

export default function* rootSaga() {
  yield all([
    watchExamSessions(),
    watchEvaluationOrder(),
    watchEvaluationPeriods(),
    watchNationalities(),
    watchPublicIdentification(),
    watchRegistration(),
    watchReservationRequest(),
    watchSession(),
  ]);
}
