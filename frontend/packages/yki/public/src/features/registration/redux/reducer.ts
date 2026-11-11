import { combineReducers } from '@reduxjs/toolkit';

import { examSessionReducer } from 'features/registration/redux/reducers/examSession';
import { examSessionsReducer } from 'features/registration/redux/reducers/examSessions';
import { loginLinkReducer } from 'features/registration/redux/reducers/loginLink';
import { publicEducationReducer } from 'features/registration/redux/reducers/publicEducation';
import { publicFreeRegistrationReducer } from 'features/registration/redux/reducers/publicFreeRegistration';
import { publicIdentificationReducer } from 'features/registration/redux/reducers/publicIdentification';
import { registrationReducer } from 'features/registration/redux/reducers/registration';

export const registrationFeatureReducer = combineReducers({
  examSession: examSessionReducer,
  examSessions: examSessionsReducer,
  loginLink: loginLinkReducer,
  publicEducation: publicEducationReducer,
  publicFreeRegistration: publicFreeRegistrationReducer,
  publicIdentification: publicIdentificationReducer,
  registration: registrationReducer,
});
