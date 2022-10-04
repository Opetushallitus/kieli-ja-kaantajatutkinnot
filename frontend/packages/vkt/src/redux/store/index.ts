import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clerkListExamEvent: clerkListExamEventReducer,
    publicExamEvent: publicExamEventReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
