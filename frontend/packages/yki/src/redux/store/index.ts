import createSagaMiddleware from '@redux-saga/core';
import { combineReducers, configureStore, Tuple } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkCustomerDetailsReducer } from 'redux/reducers/clerkCustomerDetails';
import { clerkExamSessionReducer } from 'redux/reducers/clerkExamSession';
import { clerkFreeRegistrationReducer } from 'redux/reducers/clerkFreeRegistration';
import { clerkFreeRegistrationDetailsReducer } from 'redux/reducers/clerkFreeRegistrationDetails';
import { clerkOrganizersReducer } from 'redux/reducers/clerkOrganizer';
import { confirmRegistrationReducer } from 'redux/reducers/confirmRegistration';
import { evaluationOrderReducer } from 'redux/reducers/evaluationOrder';
import { evaluationPeriodsReducer } from 'redux/reducers/evaluationPeriods';
import { examSessionReducer } from 'redux/reducers/examSession';
import { examSessionsReducer } from 'redux/reducers/examSessions';
import { loginLinkReducer } from 'redux/reducers/loginLink';
import { loginLinkRenewReducer } from 'redux/reducers/loginLinkRenew';
import { nationalitiesReducer } from 'redux/reducers/nationalities';
import { publicEducationReducer } from 'redux/reducers/publicEducation';
import { publicFreeRegistrationReducer } from 'redux/reducers/publicFreeRegistration';
import { publicIdentificationReducer } from 'redux/reducers/publicIdentification';
import { registrationReducer } from 'redux/reducers/registration';
import { sessionReducer } from 'redux/reducers/session';
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
  loginLink: loginLinkReducer,
  loginLinkRenew: loginLinkRenewReducer,
  nationalities: nationalitiesReducer,
  publicIdentification: publicIdentificationReducer,
  registration: registrationReducer,
  session: sessionReducer,
  userOpenRegistrations: userOpenRegistrationsReducer,
  userDetails: userDetailsReducer,
  clerkOrganizer: clerkOrganizersReducer,
  clerkFreeRegistration: clerkFreeRegistrationReducer,
  clerkFreeRegistrationDetails: clerkFreeRegistrationDetailsReducer,
  clerkCustomerDetails: clerkCustomerDetailsReducer,
  clerkExamSession: clerkExamSessionReducer,
  publicEducation: publicEducationReducer,
  publicFreeRegistration: publicFreeRegistrationReducer,
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
