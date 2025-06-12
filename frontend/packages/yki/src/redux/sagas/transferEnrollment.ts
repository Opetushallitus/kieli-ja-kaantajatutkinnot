import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang, translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  RelocateRequest,
  RelocateResponse,
  TransferEnrollmentDetailsResponse,
} from 'interfaces/transferEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptTransferEnrollment,
  acceptTransferEnrollmentDetails,
  loadTransferEnrollmentDetails,
  rejectTransferEnrollment,
  rejectTransferEnrollmentDetails,
  transferEnrollment,
} from 'redux/reducers/transferEnrollment';
import { SerializationUtils } from 'utils/serialization';

function* loadTransferEnrollmentDetailsSaga(action: PayloadAction<number>) {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<TransferEnrollmentDetailsResponse> =
      yield call(
        axiosInstance.get,
        APIEndpoints.TransferEnrollment.replace(
          /:registrationId/,
          `${action.payload}`,
        ),
      );
    yield put(
      acceptTransferEnrollmentDetails(
        SerializationUtils.deserializeTransferEnrollmentDetails(response.data),
      ),
    );
  } catch (error) {
    yield put(rejectTransferEnrollmentDetails());
    yield put(setAPIError(t('yki.common.error')));
  }
}

function* transferEnrollmentSaga(action: PayloadAction<RelocateRequest>) {
  const t = translateOutsideComponent();
  const lang = getCurrentLang();
  try {
    const { registration_id, to_exam_session_id } = action.payload;
    const response: AxiosResponse<RelocateResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.TransferEnrollment.replace(
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
      yield put(acceptTransferEnrollment());
    } else {
      yield put(rejectTransferEnrollment());
      yield put(setAPIError(t('yki.common.error')));
    }
  } catch (error) {
    yield put(rejectTransferEnrollment());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchTransferEnrollment() {
  yield takeLatest(
    loadTransferEnrollmentDetails.type,
    loadTransferEnrollmentDetailsSaga,
  );
  yield takeLatest(transferEnrollment.type, transferEnrollmentSaga);
}
