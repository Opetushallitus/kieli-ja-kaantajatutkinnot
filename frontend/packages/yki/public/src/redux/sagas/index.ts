import { all } from 'redux-saga/effects';

import { watchConfirmRegistration } from 'redux/sagas/confirmRegistration';
import { watchEvaluationOrder } from 'redux/sagas/evaluationOrder';
import { watchEvaluationPeriods } from 'redux/sagas/evaluationPeriod';
import { watchExamSessions } from 'redux/sagas/examSession';
import { watchLoginLink } from 'redux/sagas/loginLink';
import { watchLoginLinkRenew } from 'redux/sagas/loginLinkRenew';
import { watchNationalities } from 'redux/sagas/nationalities';
import { watchGetKoskiEducations } from 'redux/sagas/publicEducation';
import { watchPublicIdentification } from 'redux/sagas/publicIdentification';
import { watchRegistration } from 'redux/sagas/registration';
import { watchSession } from 'redux/sagas/session';
import { watchUserDetails } from 'redux/sagas/userDetails';
import { watchUserOpenRegistrations } from 'redux/sagas/userOpenRegistrations';

export default function* rootSaga() {
  yield all([
    watchExamSessions(),
    watchEvaluationOrder(),
    watchEvaluationPeriods(),
    watchNationalities(),
    watchPublicIdentification(),
    watchRegistration(),
    watchSession(),
    watchUserDetails(),
    watchUserOpenRegistrations(),
    watchConfirmRegistration(),
    watchLoginLink(),
    watchLoginLinkRenew(),
    watchGetKoskiEducations(),
  ]);
}
