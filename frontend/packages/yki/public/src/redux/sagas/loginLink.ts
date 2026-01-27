import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { LoginLinkDetailsResponse } from 'interfaces/loginLink';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptLoginLink,
  loadLoginLink,
  rejectLoginLink,
} from 'redux/reducers/loginLink';
import { SerializationUtils } from 'utils/serialization';

function* loadLoginLinkSaga(action: PayloadAction<string>) {
  const t = translateOutsideComponent();
  try {
    const code = action.payload;
    const response: AxiosResponse<LoginLinkDetailsResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.LoginLinkInfo,
      {
        params: {
          code,
        },
      },
    );
    yield put(
      acceptLoginLink(
        SerializationUtils.deserializeLoginLinkDetailsResponse(response.data),
      ),
    );
  } catch (error) {
    yield put(rejectLoginLink());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchLoginLink() {
  yield takeLatest(loadLoginLink.type, loadLoginLinkSaga);
}
