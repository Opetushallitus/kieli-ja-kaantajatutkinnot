import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicIntegrationAssistanceResponse } from 'interfaces/publicIntegrationAssistance';
import { setPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import {
  acceptIntegrationAssistance,
  checkIntegrationAssistance,
  rejectIntegrationAssistance,
} from 'redux/reducers/publicIntegrationAssistance';

function* checkIntegrationAssistanceSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<PublicIntegrationAssistanceResponse> =
      yield call(
        axiosInstance.post,
        APIEndpoints.PublicIntegrationAssistance.replace(
          /:registrationId/,
          `${action.payload}`,
        ),
      );
    const { decision, freeRegistrationId } = response.data;
    yield put(acceptIntegrationAssistance(decision));
    yield put(
      setPublicFreeRegistration({
        isFree: decision === 'FREE' ? 'YES' : 'NO',
        freeRegistrationId,
      }),
    );
  } catch (error) {
    yield put(rejectIntegrationAssistance());
    yield put(
      setPublicFreeRegistration({
        isFree: 'NO',
        freeRegistrationId: undefined,
      }),
    );
  }
}

export function* watchCheckIntegrationAssistance() {
  yield takeLatest(
    checkIntegrationAssistance.type,
    checkIntegrationAssistanceSaga,
  );
}
