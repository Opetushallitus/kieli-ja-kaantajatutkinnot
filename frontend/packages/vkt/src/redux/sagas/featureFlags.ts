import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { FeatureFlagsResponse } from 'interfaces/featureFlags';
import {
  loadFeatureFlags,
  rejectFeatureFlags,
  storeFeatureFlags,
} from 'redux/reducers/featureFlags';

function* loadFeatureFlagsSaga() {
  try {
    const response: AxiosResponse<FeatureFlagsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.FeatureFlags,
    );
    yield put(storeFeatureFlags(response.data));
  } catch (error) {
    yield put(rejectFeatureFlags());
  }
}

export function* watchFeatureFlags() {
  yield takeLatest(loadFeatureFlags.type, loadFeatureFlagsSaga);
}
