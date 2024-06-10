import { all } from 'redux-saga/effects';

import { watchClerkEnrollmentDetails } from 'redux/sagas/clerkEnrollmentDetails';
import { watchClerkExamEventOverview } from 'redux/sagas/clerkExamEventOverview';
import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchClerkNewExamDate } from 'redux/sagas/clerkNewExamDate';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchFeatureFlags } from 'redux/sagas/featureFlags';
import { watchPublicEnrollments } from 'redux/sagas/publicEnrollment';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';
import { watchFileUpload } from 'redux/sagas/publicFileUpload';
import { watchPublicUser } from 'redux/sagas/publicUser';

export default function* rootSaga() {
  yield all([
    watchListExamEvents(),
    watchClerkNewExamDate(),
    watchClerkUser(),
    watchPublicUser(),
    watchPublicEnrollments(),
    watchPublicExamEvents(),
    watchClerkExamEventOverview(),
    watchClerkEnrollmentDetails(),
    watchFeatureFlags(),
    watchFileUpload(),
  ]);
}
