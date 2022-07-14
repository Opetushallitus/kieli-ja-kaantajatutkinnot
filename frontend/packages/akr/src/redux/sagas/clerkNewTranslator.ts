import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { AxiosError, AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkNewTranslator,
  ClerkNewTranslatorAction,
} from 'interfaces/clerkNewTranslator';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import {
  CLERK_NEW_TRANSLATOR_ERROR,
  CLERK_NEW_TRANSLATOR_SAVE,
  CLERK_NEW_TRANSLATOR_SUCCESS,
} from 'redux/actionTypes/clerkNewTranslator';
import { CLERK_TRANSLATOR_RECEIVED } from 'redux/actionTypes/clerkTranslators';
import { NOTIFIER_TOAST_ADD } from 'redux/actionTypes/notifier';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

export function* updateClerkTranslatorsState(translator: ClerkTranslator) {
  const { translators, langs, meetingDates } = yield select(
    clerkTranslatorsSelector
  );
  translators.push(translator);

  yield put({
    type: CLERK_TRANSLATOR_RECEIVED,
    translators,
    langs,
    meetingDates,
  });
}

function* saveNewClerkTranslator(action: ClerkNewTranslatorAction) {
  try {
    const apiResponse: AxiosResponse<ClerkTranslatorResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.ClerkTranslator,
      SerializationUtils.serializeClerkNewTranslator(
        action.translator as ClerkNewTranslator
      )
    );
    const translator = SerializationUtils.deserializeClerkTranslator(
      apiResponse.data
    );
    yield updateClerkTranslatorsState(translator);

    yield put({
      type: CLERK_NEW_TRANSLATOR_SUCCESS,
      id: translator.id,
    });
  } catch (error) {
    yield put({
      type: CLERK_NEW_TRANSLATOR_ERROR,
    });
    yield put({
      type: NOTIFIER_TOAST_ADD,
      notifier: NotifierUtils.createAxiosErrorNotifierToast(
        error as AxiosError
      ),
    });
  }
}

export function* watchClerkNewTranslatorSave() {
  yield takeLatest(CLERK_NEW_TRANSLATOR_SAVE, saveNewClerkTranslator);
}
