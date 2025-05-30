import createSagaMiddleware from '@redux-saga/core';
import { combineReducers, configureStore, Tuple } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { confirmRegistrationReducer } from 'redux/reducers/confirmRegistration';
import { evaluationOrderReducer } from 'redux/reducers/evaluationOrder';
import { evaluationPeriodsReducer } from 'redux/reducers/evaluationPeriods';
import { examSessionReducer } from 'redux/reducers/examSession';
import { examSessionsReducer } from 'redux/reducers/examSessions';
import { nationalitiesReducer } from 'redux/reducers/nationalities';
import { publicIdentificationReducer } from 'redux/reducers/publicIdentification';
import { registrationReducer } from 'redux/reducers/registration';
import { sessionReducer } from 'redux/reducers/session';
import { transferEnrollmentReducer } from 'redux/reducers/transferEnrollment';
import { userDetailsReducer } from 'redux/reducers/userDetails';
import { userOpenRegistrationsReducer } from 'redux/reducers/userOpenRegistrations';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

export const rootReducer = combineReducers({
  APIError: APIErrorReducer,
  confirmRegistration: confirmRegistrationReducer,
  evaluationOrder: evaluationOrderReducer,
  evaluationPeriods: evaluationPeriodsReducer,
  examSessions: examSessionsReducer,
  examSession: examSessionReducer,
  nationalities: nationalitiesReducer,
  publicIdentification: publicIdentificationReducer,
  registration: registrationReducer,
  session: sessionReducer,
  transferEnrollment: transferEnrollmentReducer,
  userOpenRegistrations: userOpenRegistrationsReducer,
  userDetails: userDetailsReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: () => {
      return new Tuple(saga);
    },
    preloadedState,
  });
  saga.run(rootSaga);

  return store;
};
