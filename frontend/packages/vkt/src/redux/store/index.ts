import createSagaMiddleware from '@redux-saga/core';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'reduxjs-toolkit-persist';
import storageSession from 'reduxjs-toolkit-persist/lib/storage/session';

import { EnrollmentTransform } from 'redux/persist/transforms/EnrollmentTransform';
import { APIErrorReducer } from 'redux/reducers/APIError';
import { clerkEnrollmentDetailsReducer } from 'redux/reducers/clerkEnrollmentDetails';
import { clerkExamEventOverviewReducer } from 'redux/reducers/clerkExamEventOverview';
import { clerkListExamEventReducer } from 'redux/reducers/clerkListExamEvent';
import { clerkNewExamDateReducer } from 'redux/reducers/clerkNewExamDate';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { featureFlagsReducer } from 'redux/reducers/featureFlags';
import { publicEnrollmentReducer } from 'redux/reducers/publicEnrollment';
import { publicExamEventReducer } from 'redux/reducers/publicExamEvent';
import { publicUserReducer } from 'redux/reducers/publicUser';
import rootSaga from 'redux/sagas/index';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['publicEnrollment'],
  transforms: [EnrollmentTransform],
};

const reducer = combineReducers({
  APIError: APIErrorReducer,
  clerkListExamEvent: clerkListExamEventReducer,
  clerkUser: clerkUserReducer,
  publicUser: publicUserReducer,
  publicEnrollment: publicEnrollmentReducer,
  clerkNewExamDate: clerkNewExamDateReducer,
  publicExamEvent: publicExamEventReducer,
  clerkExamEventOverview: clerkExamEventOverviewReducer,
  clerkEnrollmentDetails: clerkEnrollmentDetailsReducer,
  featureFlags: featureFlagsReducer,
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
