import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkState, ClerkStateResponse } from 'interfaces/clerkState';
import {
  CLERK_TRANSLATOR_ERROR,
  CLERK_TRANSLATOR_LOAD,
  CLERK_TRANSLATOR_LOADING,
  CLERK_TRANSLATOR_RECEIVED,
} from 'redux/actionTypes/clerkTranslators';
import { SerializationUtils } from 'utils/serialization';

export function* fetchClerkTranslators() {
  try {
    yield put({ type: CLERK_TRANSLATOR_LOADING });
    const apiResponse: AxiosResponse<ClerkStateResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkTranslator
    );
    const deserializedResponse = SerializationUtils.deserializeClerkTranslators(
      apiResponse.data
    );
    yield call(storeApiResults, deserializedResponse);
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_ERROR, error });
  }
}

export function* storeApiResults(response: ClerkState) {
  const { translators, langs, meetingDates } = response;
  yield put({
    type: CLERK_TRANSLATOR_RECEIVED,
    translators,
    langs,
    meetingDates,
  });
}

export function* watchFetchClerkTranslators() {
  yield takeLatest(CLERK_TRANSLATOR_LOAD, fetchClerkTranslators);
}
