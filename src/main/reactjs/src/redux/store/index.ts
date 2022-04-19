import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from '@redux-saga/core';

import rootSaga from 'redux/sagas/index';
import { clerkTranslatorReducer } from 'redux/reducers/clerkTranslator';
import { publicTranslatorReducer } from 'redux/reducers/publicTranslator';
import { contactRequestReducer } from 'redux/reducers/contactRequest';
import { UIStateReducer } from 'redux/reducers/navigation';
import { notifierReducer } from 'redux/reducers/notifier';

const sagaMiddleware = createSagaMiddleware();
const middlewareEnhancer = applyMiddleware(sagaMiddleware);

export default () => {
  const composeEnhancers = composeWithDevTools({ serialize: true });
  const store = createStore(
    combineReducers({
      publicTranslator: publicTranslatorReducer,
      clerkTranslator: clerkTranslatorReducer,
      contactRequest: contactRequestReducer,
      UIState: UIStateReducer,
      notifier: notifierReducer,
    }),
    composeEnhancers(middlewareEnhancer)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
