import { all } from 'redux-saga/effects';

import { watchClerkEnrollmentDetails } from 'redux/sagas/clerkEnrollmentDetails';
import { watchClerkExamEventOverview } from 'redux/sagas/clerkExamEventOverview';
import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchClerkNewExamDate } from 'redux/sagas/clerkNewExamDate';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchFeatureFlags } from 'redux/sagas/featureFlags';
import { watchPublicEducation } from 'redux/sagas/publicEducation';
import { watchPublicEnrollments } from 'redux/sagas/publicEnrollment';
import { watchPublicEnrollmentAppointments } from 'redux/sagas/publicEnrollmentAppointment';
import { watchPublicEnrollmentContact } from 'redux/sagas/publicEnrollmentContact';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';
import { watchPublicExaminers } from 'redux/sagas/publicExaminer';
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
    watchPublicEducation(),
    watchPublicEnrollmentAppointments(),
    watchPublicEnrollmentContact(),
    watchPublicExaminers(),
  ]);
}
