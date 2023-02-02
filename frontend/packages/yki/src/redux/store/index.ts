import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: { APIError: APIErrorReducer },
  middleware: [saga],
});

saga.run(rootSaga);

export default store;
