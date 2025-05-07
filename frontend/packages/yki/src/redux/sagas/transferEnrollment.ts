import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { TransferEnrollmentDetailsResponse } from 'interfaces/transferEnrollment';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptTransferEnrollmentDetails,
  loadTransferEnrollmentDetails,
  rejectTransferEnrollmentDetails,
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

export function* watchTransferEnrollmentDetails() {
  yield takeLatest(
    loadTransferEnrollmentDetails.type,
    loadTransferEnrollmentDetailsSaga,
  );
}
