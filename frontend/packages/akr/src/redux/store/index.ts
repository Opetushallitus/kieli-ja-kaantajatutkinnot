import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { authorisationReducer } from 'redux/reducers/authorisation';
import { clerkNewTranslatorReducer } from 'redux/reducers/clerkNewTranslator';
import { clerkTranslatorReducer } from 'redux/reducers/clerkTranslator';
import { clerkTranslatorEmailReducer } from 'redux/reducers/clerkTranslatorEmail';
import { clerkTranslatorOverviewReducer } from 'redux/reducers/clerkTranslatorOverview';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { contactRequestReducer } from 'redux/reducers/contactRequest';
import { examinationDateReducer } from 'redux/reducers/examinationDate';
import { meetingDateReducer } from 'redux/reducers/meetingDate';
import { publicTranslatorReducer } from 'redux/reducers/publicTranslator';
import { publicUIViewReducer } from 'redux/reducers/publicUIView';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();
const store = configureStore({
  reducer: {
    publicTranslator: publicTranslatorReducer,
    clerkTranslator: clerkTranslatorReducer,
    clerkTranslatorEmail: clerkTranslatorEmailReducer,
    clerkTranslatorOverview: clerkTranslatorOverviewReducer,
    clerkNewTranslator: clerkNewTranslatorReducer,
    contactRequest: contactRequestReducer,
    publicUIView: publicUIViewReducer,
    clerkUser: clerkUserReducer,
    examinationDate: examinationDateReducer,
    meetingDate: meetingDateReducer,
    authorisation: authorisationReducer,
    APIError: APIErrorReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
