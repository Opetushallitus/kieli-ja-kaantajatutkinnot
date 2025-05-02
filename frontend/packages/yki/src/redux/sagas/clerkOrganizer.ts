import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
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
      '/yki/api/virkailija/organizer',
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
