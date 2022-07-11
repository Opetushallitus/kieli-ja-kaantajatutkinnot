import { all } from 'redux-saga/effects';

import { watchAddAuthorisation } from 'redux/sagas/authorisation';
import { watchClerkNewTranslatorSave } from 'redux/sagas/clerkNewTranslator';
import { watchFetchClerkTranslators } from 'redux/sagas/clerkTranslator';
import { watchClerkTranslatorOverview } from 'redux/sagas/clerkTranslatorOverview';
import { watchFetchClerkUser } from 'redux/sagas/clerkUser';
import { watchContactRequest } from 'redux/sagas/contactRequest';
import { watchExaminationDates } from 'redux/sagas/examinationDate';
import { watchMeetingDates } from 'redux/sagas/meetingDate';
import { watchClerkTranslatorDetailsNotifier } from 'redux/sagas/notifier/clerkTranslatorDetails';
import { watchClerkTranslatorEmailNotifier } from 'redux/sagas/notifier/clerkTranslatorEmail';
import { watchContactRequestNotifier } from 'redux/sagas/notifier/contactRequest';
import { watchFetchPublicTranslators } from 'redux/sagas/publicTranslator';

export default function* rootSaga() {
  yield all([
    watchFetchClerkTranslators(),
    watchFetchPublicTranslators(),
    watchContactRequest(),
    watchContactRequestNotifier(),
    watchClerkTranslatorEmailNotifier(),
    watchClerkTranslatorOverview(),
    watchClerkTranslatorDetailsNotifier(),
    watchClerkNewTranslatorSave(),
    watchFetchClerkUser(),
    watchMeetingDates(),
    watchExaminationDates(),
    watchAddAuthorisation(),
  ]);
}
