import { call, put, takeLatest } from '@redux-saga/core/effects';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PersonDetails } from 'interfaces/userDetails';
import {
  loadPersonDetails,
  rejectPersonDetails,
  storePersonDetails,
} from 'redux/reducers/userDetails';

function* loadPersonDetailsSaga() {
  try {
    const response: AxiosResponse<PersonDetails> = yield call(
      axiosInstance.get,
      APIEndpoints.PersonDetails,
    );
    yield put(storePersonDetails(response.data));
  } catch (error) {
    yield put(rejectPersonDetails());
  }
}

export function* watchUserDetails() {
  yield takeLatest(loadPersonDetails.type, loadPersonDetailsSaga);
}
