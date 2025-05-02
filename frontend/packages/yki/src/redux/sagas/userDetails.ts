import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PersonDetailsResponse } from 'interfaces/userDetails';
import {
  loadPersonDetails,
  rejectPersonDetails,
  storePersonDetails,
} from 'redux/reducers/userDetails';
import { SerializationUtils } from 'utils/serialization';

function* loadPersonDetailsSaga() {
  try {
    const response: AxiosResponse<PersonDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.PersonDetails,
    );
    yield put(
      storePersonDetails(
        SerializationUtils.deserializePersonDetails(response.data),
      ),
    );
  } catch (error) {
    yield put(rejectPersonDetails());
  }
}

export function* watchUserDetails() {
  yield takeLatest(loadPersonDetails.type, loadPersonDetailsSaga);
}
