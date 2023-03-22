import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { authReducer } from 'redux/reducers/auth';
import { clerkEnrollmentDetailsReducer } from 'redux/reducers/clerkEnrollmentDetails';
import { clerkExamEventOverviewReducer } from 'redux/reducers/clerkExamEventOverview';
import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { clerkNewExamDateReducer } from 'redux/reducers/clerkNewExamDate';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { publicEnrollmentReducer } from 'redux/reducers/publicEnrollment';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    APIError: APIErrorReducer,
    clerkListExamEvent: clerkListExamEventReducer,
    clerkUser: clerkUserReducer,
    publicEnrollment: publicEnrollmentReducer,
    clerkNewExamDate: clerkNewExamDateReducer,
    publicExamEvent: publicExamEventReducer,
    clerkExamEventOverview: clerkExamEventOverviewReducer,
    clerkEnrollmentDetails: clerkEnrollmentDetailsReducer,
    auth: authReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
