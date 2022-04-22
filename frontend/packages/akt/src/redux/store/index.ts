import { composeWithDevToolsDevelopmentOnly } from '@redux-devtools/extension';
import createSagaMiddleware from '@redux-saga/core';
import { applyMiddleware, combineReducers, createStore } from 'redux';

import { authorisationReducer } from 'redux/reducers/authorisation';
import { clerkNewTranslatorReducer } from 'redux/reducers/clerkNewTranslator';
import { clerkTranslatorReducer } from 'redux/reducers/clerkTranslator';
import { clerkTranslatorEmailReducer } from 'redux/reducers/clerkTranslatorEmail';
import { clerkTranslatorOverviewReducer } from 'redux/reducers/clerkTranslatorOverview';
import { clerkUserReducer } from 'redux/reducers/clerkUser';
import { contactRequestReducer } from 'redux/reducers/contactRequest';
import { meetingDateReducer } from 'redux/reducers/meetingDate';
import { notifierReducer } from 'redux/reducers/notifier';
import { publicTranslatorReducer } from 'redux/reducers/publicTranslator';
import { publicUIViewReducer } from 'redux/reducers/publicUIView';
import rootSaga from 'redux/sagas/index';

const sagaMiddleware = createSagaMiddleware();
const middlewareEnhancer = applyMiddleware(sagaMiddleware);

export default () => {
  const composeEnhancers = composeWithDevToolsDevelopmentOnly({
    serialize: true,
  });
  const store = createStore(
    combineReducers({
      publicTranslator: publicTranslatorReducer,
      clerkTranslator: clerkTranslatorReducer,
      clerkTranslatorEmail: clerkTranslatorEmailReducer,
      clerkTranslatorOverview: clerkTranslatorOverviewReducer,
      clerkNewTranslator: clerkNewTranslatorReducer,
      contactRequest: contactRequestReducer,
      publicUIView: publicUIViewReducer,
      clerkUser: clerkUserReducer,
      notifier: notifierReducer,
      meetingDate: meetingDateReducer,
      authorisation: authorisationReducer,
    }),
    composeEnhancers(middlewareEnhancer)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
