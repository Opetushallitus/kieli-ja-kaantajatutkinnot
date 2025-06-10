import { call, put, takeLatest, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  CancelRegistrationResponse,
  PersonDetailsResponse,
} from 'interfaces/userDetails';
import {
  acceptCancelUserRegistration,
  cancelUserRegistration,
  loadPersonDetails,
  rejectCancelUserRegistration,
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

function* cancelUserRegistrationSaga(action: PayloadAction<number>) {
  const lang = getCurrentLang();
  try {
    const response: AxiosResponse<CancelRegistrationResponse> = yield call(
      axiosInstance.delete,
      APIEndpoints.CancelUserRegistration.replace(
        /:registrationId/,
        `${action.payload}`,
      ),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
        },
      },
    );

    if (response.data.success) {
      yield put(acceptCancelUserRegistration());
    } else {
      yield put(rejectCancelUserRegistration());
    }
  } catch (error) {
    yield put(rejectCancelUserRegistration());
  }
}

export function* watchUserDetails() {
  yield takeLatest(loadPersonDetails.type, loadPersonDetailsSaga);
  yield takeLeading(cancelUserRegistration.type, cancelUserRegistrationSaga);
}
