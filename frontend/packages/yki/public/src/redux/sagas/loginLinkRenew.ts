import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  LoginLinkRenewRequest,
  LoginLinkRenewResponse,
} from 'interfaces/loginLink';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptLoginLinkRenew,
  loadLoginLinkRenew,
  rejectLoginLinkRenew,
} from 'redux/reducers/loginLinkRenew';
import { SerializationUtils } from 'utils/serialization';

function* renewLoginLinkSaga(action: PayloadAction<LoginLinkRenewRequest>) {
  const t = translateOutsideComponent();
  try {
    const { code, lang } = action.payload;
    const response: AxiosResponse<LoginLinkRenewResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.LoginLinkRenew,
      {
        code: code,
        lang: SerializationUtils.serializeAppLanguage(lang),
      },
    );
    if (response.data.success) {
      yield put(acceptLoginLinkRenew());
    } else {
      yield put(rejectLoginLinkRenew());
      yield put(setAPIError(t('yki.common.error')));
    }
  } catch (error) {
    yield put(rejectLoginLinkRenew());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchLoginLinkRenew() {
  yield takeLatest(loadLoginLinkRenew.type, renewLoginLinkSaga);
}
