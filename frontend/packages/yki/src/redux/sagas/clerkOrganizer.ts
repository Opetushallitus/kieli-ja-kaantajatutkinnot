import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkOrganizerResponse } from 'interfaces/clerkOrganizer';
import {
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizers,
} from 'redux/reducers/clerkOrganizer';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkOrganizersSaga() {
  try {
    const response: AxiosResponse<Array<ClerkOrganizerResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkOrganizer,
    );
    const organizers = response.data.map(
      SerializationUtils.deserializeClerkOrganizerResponse,
    );
    yield put(storeClerkOrganizers(organizers));
  } catch (error) {
    yield put(rejectClerkOrganizers());
  }
}

export function* watchClerkOrganizers() {
  yield takeLatest(loadClerkOrganizers.type, loadClerkOrganizersSaga);
}
