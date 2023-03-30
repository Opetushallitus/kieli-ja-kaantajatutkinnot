import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';

import { APIErrorReducer } from 'redux/reducers/APIError';
import { evaluationOrderReducer } from 'redux/reducers/evaluationOrder';
import { evaluationPeriodsReducer } from 'redux/reducers/evaluationPeriods';
import { examSessionReducer } from 'redux/reducers/examSession';
import { examSessionsReducer } from 'redux/reducers/examSessions';
import { publicIdentificationReducer } from 'redux/reducers/publicIdentification';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    APIError: APIErrorReducer,
    evaluationOrder: evaluationOrderReducer,
    evaluationPeriods: evaluationPeriodsReducer,
    examSessions: examSessionsReducer,
    examSession: examSessionReducer,
    publicIdentification: publicIdentificationReducer,
  },
  middleware: [saga],
});

saga.run(rootSaga);

export default store;
