import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { clerkInterpreterReducer } from 'redux/reducers/clerkInterpreter';
import { clerkInterpreterOverviewReducer } from 'redux/reducers/clerkInterpreterOverview';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { notifierReducer } from 'redux/reducers/notifier';
import { publicInterpreterReducer } from 'redux/reducers/publicInterpreter';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clerkInterpreter: clerkInterpreterReducer,
    clerkInterpreterOverview: clerkInterpreterOverviewReducer,
    publicInterpreter: publicInterpreterReducer,
    clerkUser: clerkUserReducer,
    notifier: notifierReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
