import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { clerkExamEventOverviewReducer } from 'redux/reducers/clerkExamEventOverview';
import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clerkListExamEvent: clerkListExamEventReducer,
    clerkUser: clerkUserReducer,
    publicExamEvent: publicExamEventReducer,
    clerkExamEventOverview: clerkExamEventOverviewReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
