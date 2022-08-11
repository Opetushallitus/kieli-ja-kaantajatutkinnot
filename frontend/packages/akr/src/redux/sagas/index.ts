import { all } from 'redux-saga/effects';

import { watchAddAuthorisation } from 'redux/sagas/authorisation';
import { watchClerkNewTranslatorSave } from 'redux/sagas/clerkNewTranslator';
import { watchFetchClerkTranslators } from 'redux/sagas/clerkTranslator';
import { watchClerkTranslatorEmail } from 'redux/sagas/clerkTranslatorEmail';
import { watchClerkTranslatorOverview } from 'redux/sagas/clerkTranslatorOverview';
import { watchFetchClerkUser } from 'redux/sagas/clerkUser';
import { watchContactRequest } from 'redux/sagas/contactRequest';
import { watchExaminationDates } from 'redux/sagas/examinationDate';
import { watchMeetingDates } from 'redux/sagas/meetingDate';
import { watchFetchPublicTranslators } from 'redux/sagas/publicTranslator';

export default function* rootSaga() {
  yield all([
    watchFetchClerkTranslators(),
    watchFetchPublicTranslators(),
    watchContactRequest(),
    watchClerkTranslatorEmail(),
    watchClerkTranslatorOverview(),
    watchClerkNewTranslatorSave(),
    watchFetchClerkUser(),
    watchMeetingDates(),
    watchExaminationDates(),
    watchAddAuthorisation(),
  ]);
}
