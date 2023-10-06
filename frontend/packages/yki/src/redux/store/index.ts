import createSagaMiddleware from '@redux-saga/core';
import {
  combineReducers,
  configureStore,
  PreloadedState,
} from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { evaluationOrderReducer } from 'redux/reducers/evaluationOrder';
import { evaluationPeriodsReducer } from 'redux/reducers/evaluationPeriods';
import { examSessionReducer } from 'redux/reducers/examSession';
import { examSessionsReducer } from 'redux/reducers/examSessions';
import { nationalitiesReducer } from 'redux/reducers/nationalities';
import { publicIdentificationReducer } from 'redux/reducers/publicIdentification';
import { registrationReducer } from 'redux/reducers/registration';
import { reservationReducer } from 'redux/reducers/reservation';
import { sessionReducer } from 'redux/reducers/session';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

export const rootReducer = combineReducers({
  APIError: APIErrorReducer,
  evaluationOrder: evaluationOrderReducer,
  evaluationPeriods: evaluationPeriodsReducer,
  examSessions: examSessionsReducer,
  examSession: examSessionReducer,
  nationalities: nationalitiesReducer,
  publicIdentification: publicIdentificationReducer,
  registration: registrationReducer,
  reservation: reservationReducer,
  session: sessionReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: [saga],
    preloadedState,
  });
  saga.run(rootSaga);

  return store;
};
