import { all } from 'redux-saga/effects';

import { watchClerkCustomerDetails } from 'redux/sagas/clerkCustomerDetails';
import { watchClerkCustomersSearch } from 'redux/sagas/clerkCustomersSearch';
import { watchClerkExamSession } from 'redux/sagas/clerkExamSession';
import { watchClerkFreeRegistrations } from 'redux/sagas/clerkFreeRegistration';
import { watchClerkFreeRegistrationDetails } from 'redux/sagas/clerkFreeRegistrationDetails';
import { watchClerkOrganizers } from 'redux/sagas/clerkOrganizer';
import { watchExamDates } from 'redux/sagas/examDate';
import { watchNationalities } from 'redux/sagas/nationalities';
import { watchSession } from 'redux/sagas/session';

export default function* rootSaga() {
  yield all([
    watchClerkOrganizers(),
    watchClerkFreeRegistrations(),
    watchClerkFreeRegistrationDetails(),
    watchClerkCustomerDetails(),
    watchClerkExamSession(),
    watchClerkCustomersSearch(),
    watchExamDates(),
    watchNationalities(),
    watchSession(),
  ]);
}
