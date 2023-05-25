import createSagaMiddleware from '@redux-saga/core';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'reduxjs-toolkit-persist';
import storageSession from 'reduxjs-toolkit-persist/lib/storage/session';

import { DateTransform } from 'redux/persist/transforms/DateTransform';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkEnrollmentDetailsReducer } from 'redux/reducers/clerkEnrollmentDetails';
import { clerkExamEventOverviewReducer } from 'redux/reducers/clerkExamEventOverview';
import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { clerkNewExamDateReducer } from 'redux/reducers/clerkNewExamDate';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { publicEnrollmentReducer } from 'redux/reducers/publicEnrollment';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import rootSaga from 'redux/sagas/index';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['publicEnrollment'],
  transforms: [DateTransform],
};

const reducer = combineReducers({
  APIError: APIErrorReducer,
  clerkListExamEvent: clerkListExamEventReducer,
  clerkUser: clerkUserReducer,
  publicEnrollment: publicEnrollmentReducer,
  clerkNewExamDate: clerkNewExamDateReducer,
  publicExamEvent: publicExamEventReducer,
  clerkExamEventOverview: clerkExamEventOverviewReducer,
  clerkEnrollmentDetails: clerkEnrollmentDetailsReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: [saga],
});
saga.run(rootSaga);

export const persistor = persistStore(store);

export default store;
