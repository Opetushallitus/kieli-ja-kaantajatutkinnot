import { all } from 'redux-saga/effects';

import { watchFetchPublicTranslators } from 'redux/sagas/publicTranslator';

export default function* rootSaga() {
  yield all([watchFetchPublicTranslators()]);
}
