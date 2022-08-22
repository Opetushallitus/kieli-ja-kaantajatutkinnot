import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import {
  rejectClerkNewTranslator,
  saveClerkNewTranslator,
  storeClerkNewTranslator,
} from 'redux/reducers/clerkNewTranslator';
import { updateClerkTranslatorsState } from 'redux/sagas/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';
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
    const { translators } = yield select(clerkTranslatorsSelector);
    const updatedClerkTranslators = [...translators, translator];
    yield updateClerkTranslatorsState(updatedClerkTranslators);

    yield put(storeClerkNewTranslator(translator.id));
  } catch (error) {
    yield put(rejectClerkNewTranslator(error as AxiosError));
  }
}

export function* watchClerkNewTranslatorSave() {
  yield takeLatest(saveClerkNewTranslator, saveClerkNewTranslatorSaga);
}
