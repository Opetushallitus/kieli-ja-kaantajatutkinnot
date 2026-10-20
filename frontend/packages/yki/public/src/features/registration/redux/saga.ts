import { all } from 'redux-saga/effects';

import { watchExamSessions } from 'features/registration/redux/sagas/examSession';
import { watchLoginLink } from 'features/registration/redux/sagas/loginLink';
import { watchGetKoskiEducations } from 'features/registration/redux/sagas/publicEducation';
import { watchPublicIdentification } from 'features/registration/redux/sagas/publicIdentification';
import { watchRegistration } from 'features/registration/redux/sagas/registration';

export function* watchRegistrationFeature() {
  yield all([
    watchExamSessions(),
    watchLoginLink(),
    watchGetKoskiEducations(),
    watchPublicIdentification(),
    watchRegistration(),
  ]);
}
