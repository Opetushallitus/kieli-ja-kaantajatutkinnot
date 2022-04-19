import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkTranslatorAPIResponse,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import {
  CLERK_TRANSLATOR_LOAD,
  CLERK_TRANSLATOR_LOADING,
  CLERK_TRANSLATOR_ERROR,
  CLERK_TRANSLATOR_RECEIVED,
} from 'redux/actionTypes/clerkTranslators';
import { APIUtils } from 'utils/api';

const convertAPIResponse = (
  response: ClerkTranslatorAPIResponse
): ClerkTranslatorResponse => {
  const APITranslators = response.translators;
  const { towns, langs } = response;
  const translators = APITranslators.map((t) => ({
    ...t,
    authorisations: t.authorisations.map((a) => ({
      ...a,
      term: APIUtils.convertAPIAuthorisationTerm(a.term),
    })),
  }));

  return { translators, towns, langs };
};

function* fetchClerkTranslators() {
  try {
    yield put({ type: CLERK_TRANSLATOR_LOADING });
    const apiResponse: AxiosResponse<ClerkTranslatorAPIResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkTranslator
    );
    const convertedResponse = convertAPIResponse(apiResponse.data);
    yield call(storeApiResults, convertedResponse);
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_ERROR, error });
  }
}

export function* storeApiResults(response: ClerkTranslatorResponse) {
  const { translators, langs, towns } = response;
  yield put({
    type: CLERK_TRANSLATOR_RECEIVED,
    translators,
    langs,
    towns,
  });
}

export function* watchFetchClerkTranslators() {
  yield takeLatest(CLERK_TRANSLATOR_LOAD, fetchClerkTranslators);
}
