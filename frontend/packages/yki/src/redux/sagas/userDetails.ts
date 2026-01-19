import { call, put, takeLatest, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse, isAxiosError } from 'axios';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  CancelRegistrationResponse,
  ModifyContactDetails,
  ModifyContactDetailsResponse,
  PersonDetailsResponse,
} from 'interfaces/userDetails';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptCancelUserRegistration,
  acceptModifyContactDetails,
  cancelUserRegistration,
  doModifyContactDetails,
  loadPersonDetails,
  rejectCancelUserRegistration,
  rejectModifyContactDetails,
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
    if (isAxiosError(error) && error.response?.status === 404) {
      // 404 is a legitimate API response, indicating that logged in user has no registrations in YKI as of yet
      yield put(storePersonDetails());
    } else {
      yield put(rejectPersonDetails());
    }
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

function* modifyContactDetailsSaga(
  action: PayloadAction<ModifyContactDetails>,
) {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<ModifyContactDetailsResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.PersonDetails,
      JSON.stringify(
        SerializationUtils.serializeModifyContactDetailsRequest(action.payload),
      ),
    );

    if (response.data.success) {
      yield put(acceptModifyContactDetails());
    } else {
      yield put(rejectModifyContactDetails());
    }
  } catch (error) {
    yield put(rejectModifyContactDetails());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchUserDetails() {
  yield takeLatest(loadPersonDetails.type, loadPersonDetailsSaga);
  yield takeLeading(cancelUserRegistration.type, cancelUserRegistrationSaga);
  yield takeLatest(doModifyContactDetails.type, modifyContactDetailsSaga);
}
