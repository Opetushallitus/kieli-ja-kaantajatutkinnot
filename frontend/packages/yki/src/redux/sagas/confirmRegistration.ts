import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { RegistrationToConfirmDetailsResponse } from 'interfaces/confirmRegistration';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptRegistrationToConfirmDetails,
  loadRegistrationToConfirmDetails,
  rejectRegistrationToConfirmDetails,
} from 'redux/reducers/confirmRegistration';
import { SerializationUtils } from 'utils/serialization';

function* loadRegistrationToConfirmDetailsSaga(action: PayloadAction<number>) {
  const t = translateOutsideComponent();
  const lang = getCurrentLang();
  try {
    const response: AxiosResponse<RegistrationToConfirmDetailsResponse> =
      yield call(
        axiosInstance.get,
        APIEndpoints.ConfirmRegistration.replace(
          /:registrationId/,
          `${action.payload}`,
        ),
        {
          params: {
            lang: SerializationUtils.serializeAppLanguage(lang),
          },
        },
      );
    yield put(
      acceptRegistrationToConfirmDetails(
        SerializationUtils.deserializeRegistrationToConfirmDetailsResponse(
          response.data,
        ),
      ),
    );
  } catch (error) {
    yield put(rejectRegistrationToConfirmDetails());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchConfirmRegistration() {
  yield takeLatest(
    loadRegistrationToConfirmDetails.type,
    loadRegistrationToConfirmDetailsSaga,
  );
}
