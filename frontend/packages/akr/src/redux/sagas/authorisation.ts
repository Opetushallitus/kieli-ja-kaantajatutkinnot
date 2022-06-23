import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { AddAuthorisationAction } from 'interfaces/authorisation';
import {
  CLERK_TRANSLATOR_AUTHORISATION_ADD,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS,
} from 'redux/actionTypes/authorisation';
import { CLERK_TRANSLATOR_OVERVIEW_FETCH } from 'redux/actionTypes/clerkTranslatorOverview';
import { SerializationUtils } from 'utils/serialization';

// TODO: other authorisation actions currently under clerkTranslatorOverview
export function* addAuthorisation(action: AddAuthorisationAction) {
  try {
    const { translatorId } = action.authorisation;
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.authorisation)
    );
    yield put({ type: CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS });
    yield put({ type: CLERK_TRANSLATOR_OVERVIEW_FETCH, id: translatorId });
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR, error });
  }
}

export function* watchAddAuthorisation() {
  yield takeLatest(CLERK_TRANSLATOR_AUTHORISATION_ADD, addAuthorisation);
}
