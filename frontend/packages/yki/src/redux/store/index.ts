import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { examSessionsReducer } from 'redux/reducers/examSessions';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: { APIError: APIErrorReducer, examSessions: examSessionsReducer },
  middleware: [saga],
});

saga.run(rootSaga);

export default store;
