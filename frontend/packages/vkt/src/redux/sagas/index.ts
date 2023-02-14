import { all } from 'redux-saga/effects';

import { watchAuth } from 'redux/sagas/auth';
import { watchClerkEnrollmentDetails } from 'redux/sagas/clerkEnrollmentDetails';
import { watchClerkExamEventOverview } from 'redux/sagas/clerkExamEventOverview';
import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchClerkNewExamDate } from 'redux/sagas/clerkNewExamDate';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchPublicEnrollments } from 'redux/sagas/publicEnrollment';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';

export default function* rootSaga() {
  yield all([
    watchListExamEvents(),
    watchClerkNewExamDate(),
    watchClerkUser(),
    watchPublicEnrollments(),
    watchPublicExamEvents(),
    watchClerkExamEventOverview(),
    watchClerkEnrollmentDetails(),
    watchAuth(),
  ]);
}
