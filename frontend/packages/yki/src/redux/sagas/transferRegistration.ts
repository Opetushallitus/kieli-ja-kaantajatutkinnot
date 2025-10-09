import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  RelocateRequest,
  RelocateResponse,
  TransferRegistrationDetailsResponse,
} from 'interfaces/transferRegistration';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptTransferRegistration,
  acceptTransferRegistrationDetails,
  loadTransferRegistrationDetails,
  rejectTransferRegistration,
  rejectTransferRegistrationDetails,
  transferRegistration,
} from 'redux/reducers/transferRegistration';
import { SerializationUtils } from 'utils/serialization';

function* loadTransferRegistrationDetailsSaga(action: PayloadAction<number>) {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<TransferRegistrationDetailsResponse> =
      yield call(
        axiosInstance.get,
        APIEndpoints.TransferRegistration.replace(
          /:registrationId/,
          `${action.payload}`,
        ),
      );
    yield put(
      acceptTransferRegistrationDetails(
        SerializationUtils.deserializeTransferRegistrationDetails(
          response.data,
        ),
      ),
    );
  } catch (error) {
    yield put(rejectTransferRegistrationDetails());
    yield put(setAPIError(t('yki.common.error')));
  }
}

function* transferRegistrationSaga(action: PayloadAction<RelocateRequest>) {
  const t = translateOutsideComponent();
  const lang = getCurrentLang();
  try {
    const { registration_id, to_exam_session_id } = action.payload;
    const response: AxiosResponse<RelocateResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.TransferRegistration.replace(
        /:registrationId/,
        `${registration_id}`,
      ),
      JSON.stringify({ to_exam_session_id }),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
        },
      },
    );
    const { success } = response.data;
    if (success) {
      yield put(acceptTransferRegistration());
    } else {
      yield put(rejectTransferRegistration());
      yield put(setAPIError(t('yki.common.error')));
    }
  } catch (error) {
    yield put(rejectTransferRegistration());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchTransferRegistration() {
  yield takeLatest(
    loadTransferRegistrationDetails.type,
    loadTransferRegistrationDetailsSaga,
  );
  yield takeLatest(transferRegistration.type, transferRegistrationSaga);
}
