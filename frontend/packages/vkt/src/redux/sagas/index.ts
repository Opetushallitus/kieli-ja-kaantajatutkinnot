import { all } from 'redux-saga/effects';

import { watchClerkEnrollmentAppointment } from 'redux/sagas/clerkEnrollmentAppointment';
import { watchClerkEnrollmentContactRequest } from 'redux/sagas/clerkEnrollmentContactRequest';
import { watchClerkEnrollmentDetails } from 'redux/sagas/clerkEnrollmentDetails';
import { watchClerkExamEventOverview } from 'redux/sagas/clerkExamEventOverview';
import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchListExaminers } from 'redux/sagas/clerkListExaminer';
import { watchClerkNewExamDate } from 'redux/sagas/clerkNewExamDate';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchExaminerDetails } from 'redux/sagas/examinerDetails';
import { watchExaminerDetailsInit } from 'redux/sagas/examinerDetailsInit';
import { watchExaminerDetailsUpsert } from 'redux/sagas/examinerDetailsUpsert';
import { watchExaminerExamEventOverview } from 'redux/sagas/examinerExamEventOverview';
import { watchExaminerExamEventUpsert } from 'redux/sagas/examinerExamEventUpsert';
import { watchFeatureFlags } from 'redux/sagas/featureFlags';
import { watchPublicEducation } from 'redux/sagas/publicEducation';
import { watchPublicEnrollments } from 'redux/sagas/publicEnrollment';
import { watchPublicEnrollmentAppointments } from 'redux/sagas/publicEnrollmentAppointment';
import { watchPublicEnrollmentContact } from 'redux/sagas/publicEnrollmentContact';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';
import { watchPublicExaminers } from 'redux/sagas/publicExaminer';
import {
  watchContactFileUpload,
  watchFileUpload,
} from 'redux/sagas/publicFileUpload';
import { watchPublicUser } from 'redux/sagas/publicUser';

export default function* rootSaga() {
  yield all([
    watchListExamEvents(),
    watchClerkNewExamDate(),
    watchClerkEnrollmentContactRequest(),
    watchClerkEnrollmentAppointment(),
    watchClerkUser(),
    watchPublicUser(),
    watchPublicEnrollments(),
    watchPublicExamEvents(),
    watchClerkExamEventOverview(),
    watchClerkEnrollmentDetails(),
    watchFeatureFlags(),
    watchFileUpload(),
    watchContactFileUpload(),
    watchPublicEducation(),
    watchPublicEnrollmentAppointments(),
    watchPublicEnrollmentContact(),
    watchPublicExaminers(),
    watchPublicExaminers(),
    watchExaminerDetails(),
    watchExaminerDetailsInit(),
    watchExaminerDetailsUpsert(),
    watchExaminerExamEventOverview(),
    watchListExaminers(),
    watchExaminerExamEventUpsert(),
  ]);
}
