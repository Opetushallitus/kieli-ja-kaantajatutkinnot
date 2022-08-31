import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkInterpreterReducer } from 'redux/reducers/clerkInterpreter';
import { clerkInterpreterOverviewReducer } from 'redux/reducers/clerkInterpreterOverview';
import { clerkPersonSearchReducer } from 'redux/reducers/clerkPersonSearch';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { meetingDateReducer } from 'redux/reducers/meetingDate';
import { publicInterpreterReducer } from 'redux/reducers/publicInterpreter';
import { qualificationReducer } from 'redux/reducers/qualification';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clerkInterpreter: clerkInterpreterReducer,
    clerkInterpreterOverview: clerkInterpreterOverviewReducer,
    clerkPersonSearch: clerkPersonSearchReducer,
    publicInterpreter: publicInterpreterReducer,
    clerkUser: clerkUserReducer,
    meetingDate: meetingDateReducer,
    qualification: qualificationReducer,
    APIError: APIErrorReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
