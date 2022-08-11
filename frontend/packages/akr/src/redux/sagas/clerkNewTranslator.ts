import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import {
  rejectClerkNewTranslator,
  saveClerkNewTranslator,
  storeClerkNewTranslator,
} from 'redux/reducers/clerkNewTranslator';
import { storeClerkTranslators } from 'redux/reducers/clerkTranslator';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

export function* updateClerkTranslatorsState(translator: ClerkTranslator) {
  const { translators, langs, meetingDates, examinationDates } = yield select(
    clerkTranslatorsSelector
  );
  const updatedTranslators = [...translators, translator];

  yield put(
    storeClerkTranslators({
      translators: updatedTranslators,
      langs,
      meetingDates,
      examinationDates,
    })
  );
}

function* insertNewClerkTranslator(action: PayloadAction<ClerkNewTranslator>) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkTranslator,
      SerializationUtils.serializeClerkNewTranslator(action.payload)
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield updateClerkTranslatorsState(translator);

    yield put(storeClerkNewTranslator(translator.id));
  } catch (error) {
    yield put(rejectClerkNewTranslator());
    yield put(
      showNotifierToast(
        NotifierUtils.createAxiosErrorNotifierToast(error as AxiosError)
      )
    );
  }
}

export function* watchClerkNewTranslatorSave() {
  yield takeLatest(saveClerkNewTranslator, insertNewClerkTranslator);
}
