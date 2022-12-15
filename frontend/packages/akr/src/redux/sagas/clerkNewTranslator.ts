import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { setAPIError } from 'redux/reducers/APIError';
import {
  rejectClerkNewTranslator,
  saveClerkNewTranslator,
  storeClerkNewTranslator,
} from 'redux/reducers/clerkNewTranslator';
import { upsertClerkTranslator } from 'redux/reducers/clerkTranslator';
import { setClerkTranslatorOverview } from 'redux/reducers/clerkTranslatorOverview';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* saveClerkNewTranslatorSaga(
  action: PayloadAction<ClerkNewTranslator>
) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkTranslator,
      SerializationUtils.serializeClerkNewTranslator(action.payload)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield put(upsertClerkTranslator(translator));
    yield put(storeClerkNewTranslator(translator.id));
    yield put(setClerkTranslatorOverview(translator));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkNewTranslator());
  }
}

export function* watchClerkNewTranslatorSave() {
  yield takeLatest(saveClerkNewTranslator.type, saveClerkNewTranslatorSaga);
}
