import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { notifierReducer } from 'redux/reducers/notifier';
import { publicInterpreterReducer } from 'redux/reducers/publicInterpreter';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    publicInterpreter: publicInterpreterReducer,
    notifier: notifierReducer,
  },
  middleware: [saga],
});

saga.run(rootSaga);

export default store;
