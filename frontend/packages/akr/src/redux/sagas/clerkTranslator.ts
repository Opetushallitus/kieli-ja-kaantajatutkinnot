import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkStateResponse } from 'interfaces/clerkState';
import { rejectClerkNewTranslator } from 'redux/reducers/clerkNewTranslator';
import {
  loadClerkTranslators,
  storeClerkTranslators,
} from 'redux/reducers/clerkTranslator';
import { SerializationUtils } from 'utils/serialization';

export function* fetchClerkTranslators() {
  try {
    const apiResponse: AxiosResponse<ClerkStateResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkTranslator
    );
    const deserializedResponse = SerializationUtils.deserializeClerkTranslators(
      apiResponse.data
    );

    yield put(storeClerkTranslators(deserializedResponse));
  } catch (error) {
    yield put(rejectClerkNewTranslator());
  }
}

export function* watchFetchClerkTranslators() {
  yield takeLatest(loadClerkTranslators, fetchClerkTranslators);
}
