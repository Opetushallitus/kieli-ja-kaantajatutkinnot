import { composeWithDevToolsDevelopmentOnly } from '@redux-devtools/extension';
import createSagaMiddleware from '@redux-saga/core';
import { applyMiddleware, combineReducers, createStore } from 'redux';

import { notifierReducer } from 'redux/reducers/notifier';
import { publicTranslatorReducer } from 'redux/reducers/publicTranslator';
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
      notifier: notifierReducer,
    }),
    composeEnhancers(middlewareEnhancer)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
