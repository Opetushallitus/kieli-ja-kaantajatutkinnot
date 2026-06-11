import createSagaMiddleware from '@redux-saga/core';
import { combineReducers, configureStore, Tuple } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkCustomerDetailsReducer } from 'redux/reducers/clerkCustomerDetails';
import { clerkCustomersSearchReducer } from 'redux/reducers/clerkCustomersSearch';
import { clerkExamSessionReducer } from 'redux/reducers/clerkExamSession';
import { clerkOrganizersReducer } from 'redux/reducers/clerkOrganizer';
import { clerkQuarantineReducer } from 'redux/reducers/clerkQuarantine';
import { examDateReducer } from 'redux/reducers/examDate';
import { nationalitiesReducer } from 'redux/reducers/nationalities';
import { sessionReducer } from 'redux/reducers/session';
import { userReducer } from 'redux/reducers/user';
import rootSaga from 'redux/sagas/index';

const saga = createSagaMiddleware();

export const rootReducer = combineReducers({
  APIError: APIErrorReducer,
  clerkOrganizer: clerkOrganizersReducer,
  clerkCustomerDetails: clerkCustomerDetailsReducer,
  clerkCustomersSearch: clerkCustomersSearchReducer,
  clerkQuarantine: clerkQuarantineReducer,
  clerkExamSession: clerkExamSessionReducer,
  examDate: examDateReducer,
  nationalities: nationalitiesReducer,
  session: sessionReducer,
  user: userReducer,
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
