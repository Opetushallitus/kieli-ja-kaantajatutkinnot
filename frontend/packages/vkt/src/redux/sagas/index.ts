import { all } from 'redux-saga/effects';

import { watchClerkExamEventOverview } from 'redux/sagas/clerkExamEventOverview';
import { watchListExamEvents } from 'redux/sagas/clerkListExamEvent';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchPublicExamEvents } from 'redux/sagas/publicExamEvent';
import { watchPublicReservations } from 'redux/sagas/publicReservation';

export default function* rootSaga() {
  yield all([
    watchListExamEvents(),
    watchClerkUser(),
    watchPublicExamEvents(),
    watchPublicReservations(),
    watchClerkExamEventOverview(),
  ]);
}
