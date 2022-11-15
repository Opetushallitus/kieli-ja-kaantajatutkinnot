import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import { publicReservationReducer } from 'redux/reducers/publicReservation';
import { publicUIViewReducer } from 'redux/reducers/publicUIView';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    APIError: APIErrorReducer,
    clerkListExamEvent: clerkListExamEventReducer,
    clerkUser: clerkUserReducer,
    publicExamEvent: publicExamEventReducer,
    publicReservationReducer: publicReservationReducer,
    publicUIView: publicUIViewReducer,
  },
  middleware: [saga],
});
saga.run(rootSaga);

export default store;
