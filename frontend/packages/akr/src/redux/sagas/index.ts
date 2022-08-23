import { all } from 'redux-saga/effects';

import { watchAuthorisations } from 'redux/sagas/authorisation';
import { watchClerkNewTranslatorSave } from 'redux/sagas/clerkNewTranslator';
import { watchClerkTranslators } from 'redux/sagas/clerkTranslator';
import { watchClerkTranslatorEmail } from 'redux/sagas/clerkTranslatorEmail';
import { watchClerkTranslatorOverview } from 'redux/sagas/clerkTranslatorOverview';
import { watchClerkUser } from 'redux/sagas/clerkUser';
import { watchContactRequest } from 'redux/sagas/contactRequest';
import { watchExaminationDates } from 'redux/sagas/examinationDate';
import { watchMeetingDates } from 'redux/sagas/meetingDate';
import { watchPublicTranslators } from 'redux/sagas/publicTranslator';

export default function* rootSaga() {
  yield all([
    watchClerkTranslators(),
    watchPublicTranslators(),
    watchContactRequest(),
    watchClerkTranslatorEmail(),
    watchClerkTranslatorOverview(),
    watchClerkNewTranslatorSave(),
    watchClerkUser(),
    watchMeetingDates(),
    watchExaminationDates(),
    watchAuthorisations(),
  ]);
}
