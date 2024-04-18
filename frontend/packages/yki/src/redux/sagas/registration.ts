import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse, isAxiosError } from 'axios';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitResponse,
} from 'interfaces/publicRegistration';
import { resetExamSession, storeExamSession } from 'redux/reducers/examSession';
import {
  acceptCancelRegistration,
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  cancelRegistration,
  initRegistration,
  RegistrationState,
  rejectCancelRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  resetPublicRegistration,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { resetSession } from 'redux/reducers/session';
import { resetUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';
import { SerializationUtils } from 'utils/serialization';

function* initRegistrationSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<PublicRegistrationInitResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.InitRegistration,
      JSON.stringify({ exam_session_id: action.payload }),
    );
    const { data } = response;
    yield put(
      storeExamSession(
        SerializationUtils.deserializeExamSessionResponse(data.exam_session),
      ),
    );
    yield put(acceptPublicRegistrationInit(data));
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationInitErrorResponse>;
      yield put(rejectPublicRegistrationInit(response));
      if (response.status === 401) {
        yield put(resetSession());
      }
    } else {
      yield put(rejectPublicRegistrationInit());
    }
  }
}

function* submitRegistrationFormSaga() {
  try {
    const lang = getCurrentLang();
    const registrationState: RegistrationState =
      yield select(registrationSelector);
    const { nationalities } = yield select(nationalitiesSelector);
    yield call(
      axiosInstance.post,
      APIEndpoints.SubmitRegistration.replace(
        /:registrationId/,
        `${registrationState.registration.id}`,
      ),
      JSON.stringify(
        SerializationUtils.serializeRegistrationForm(
          registrationState.registration,
          nationalities,
        ),
      ),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
        },
      },
    );
    yield put(acceptPublicRegistrationSubmission());
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('caught error!', error);
    if (isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationFormSubmitErrorResponse>;

      if (response.data && response.data.error) {
        yield put(rejectPublicRegistrationSubmission(response.data));
      } else if (response.status === 401) {
        yield put(resetSession());
      } else {
        yield put(rejectPublicRegistrationSubmission({ error: {} }));
      }
    } else {
      yield put(rejectPublicRegistrationSubmission({ error: {} }));
    }
  }
}

function* cancelRegistrationSaga() {
  try {
    const { registration }: RegistrationState =
      yield select(registrationSelector);
    yield call(
      axiosInstance.delete,
      APIEndpoints.Registration.replace(
        /:registrationId/,
        `${registration.id}`,
      ),
    );
    yield put(acceptCancelRegistration());
    yield put(resetPublicRegistration());
    yield put(resetExamSession());
    yield put(resetUserOpenRegistrations());
  } catch (error) {
    yield put(rejectCancelRegistration());
    if (isAxiosError(error) && error.status === 401) {
      yield put(resetSession());
    }
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
  yield takeLatest(submitPublicRegistration.type, submitRegistrationFormSaga);
  yield takeLatest(cancelRegistration.type, cancelRegistrationSaga);
}
