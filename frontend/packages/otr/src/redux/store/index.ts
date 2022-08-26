import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { clerkInterpreterReducer } from 'redux/reducers/clerkInterpreter';
import { clerkInterpreterOverviewReducer } from 'redux/reducers/clerkInterpreterOverview';
import { clerkNewInterpreterReducer } from 'redux/reducers/clerkNewInterpreter';
import { clerkPersonSearchReducer } from 'redux/reducers/clerkPersonSearch';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { meetingDateReducer } from 'redux/reducers/meetingDate';
import { notifierReducer } from 'redux/reducers/notifier';
import { publicInterpreterReducer } from 'redux/reducers/publicInterpreter';
import { qualificationReducer } from 'redux/reducers/qualification';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clerkInterpreter: clerkInterpreterReducer,
    clerkInterpreterOverview: clerkInterpreterOverviewReducer,
    clerkNewInterpreter: clerkNewInterpreterReducer,
    clerkPersonSearch: clerkPersonSearchReducer,
    publicInterpreter: publicInterpreterReducer,
    clerkUser: clerkUserReducer,
    meetingDate: meetingDateReducer,
    notifier: notifierReducer,
    qualification: qualificationReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
