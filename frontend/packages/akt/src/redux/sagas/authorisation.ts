import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { Severity } from 'enums/app';
import { AddAuthorisationAction } from 'interfaces/authorisation';
import {
  CLERK_TRANSLATOR_AUTHORISATION_ADD,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR,
  CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS,
} from 'redux/actionTypes/authorisation';
import { CLERK_TRANSLATOR_OVERVIEW_FETCH } from 'redux/actionTypes/clerkTranslatorOverview';
import { NOTIFIER_TOAST_ADD } from 'redux/actionTypes/notifier';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* showSuccessToastOnAdd() {
  const t = translateOutsideComponent();
  const notifier = NotifierUtils.createNotifierToast(
    Severity.Success,
    t('akt.component.newAuthorisation.toasts.success')
  );
  yield put({ type: NOTIFIER_TOAST_ADD, notifier });
}

// TODO: other authorisation actions currently under clerkTranslatorOverview
export function* addAuthorisation(action: AddAuthorisationAction) {
  try {
    const { translatorId } = action.authorisation;
    yield call(
      axiosInstance.post,
      `${APIEndpoints.ClerkTranslator}/${translatorId}/authorisation`,
      SerializationUtils.serializeAuthorisation(action.authorisation)
    );
    yield put({ type: CLERK_TRANSLATOR_AUTHORISATION_ADD_SUCCESS });
    yield call(showSuccessToastOnAdd);
    yield put({ type: CLERK_TRANSLATOR_OVERVIEW_FETCH, id: translatorId });
  } catch (error) {
    yield put({ type: CLERK_TRANSLATOR_AUTHORISATION_ADD_ERROR });
    yield put({
      type: NOTIFIER_TOAST_ADD,
      notifier: NotifierUtils.createAxiosErrorNotifierToast(
        error as AxiosError
      ),
    });
  }
}

export function* watchAddAuthorisation() {
  yield takeLatest(CLERK_TRANSLATOR_AUTHORISATION_ADD, addAuthorisation);
}
