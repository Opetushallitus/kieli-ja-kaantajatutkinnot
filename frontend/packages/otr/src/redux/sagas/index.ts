import { all } from 'redux-saga/effects';

import { watchClerkInterpreters } from 'redux/sagas/clerkInterpreter';
import { watchClerkInterpreterOverview } from 'redux/sagas/clerkInterpreterOverview';
import { watchClerkPersonSearch } from 'redux/sagas/clerkPersonSearch';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchMeetingDates } from 'redux/sagas/meetingDate';
import { watchPublicInterpreters } from 'redux/sagas/publicInterpreter';
import { watchQualificationUpdates } from 'redux/sagas/qualification';

export default function* rootSaga() {
  yield all([
    watchPublicInterpreters(),
    watchClerkInterpreters(),
    watchClerkInterpreterOverview(),
    watchClerkPersonSearch(),
    watchClerkUser(),
    watchQualificationUpdates(),
    watchMeetingDates(),
  ]);
}
