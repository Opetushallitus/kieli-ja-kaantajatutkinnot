import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  PublicRegistrationFormSubmitErrorResponse,
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitResponse,
} from 'interfaces/publicRegistration';
import { storeExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  initRegistration,
  RegistrationState,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';
import { SerializationUtils } from 'utils/serialization';

function* initRegistrationSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<PublicRegistrationInitResponse> = yield call(
      axiosInstance.post,
      APIEndpoints.InitRegistration,
      JSON.stringify({ exam_session_id: action.payload })
    );
    const { data } = response;
    yield put(
      storeExamSession(
        SerializationUtils.deserializeExamSessionResponse(data.exam_session)
      )
    );
    yield put(acceptPublicRegistrationInit(data));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationInitErrorResponse>;
      yield put(rejectPublicRegistrationInit(response.data));
    } else {
      yield put(rejectPublicRegistrationInit({ error: {} }));
    }
  }
}

function* submitRegistrationFormSaga() {
  try {
    const lang = getCurrentLang();
    const registrationState: RegistrationState = yield select(
      registrationSelector
    );
    const { nationalities } = yield select(nationalitiesSelector);
    yield call(
      axiosInstance.post,
      APIEndpoints.SubmitRegistration.replace(
        /:registrationId/,
        `${registrationState.registration.id}`
      ),
      JSON.stringify(
        SerializationUtils.serializeRegistrationForm(
          registrationState.registration,
          nationalities
        )
      ),
      {
        params: {
          lang: SerializationUtils.serializeAppLanguage(lang),
          'use-yki-ui': true,
        },
      }
    );
    yield put(acceptPublicRegistrationSubmission());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('caught error!', error);
    if (axios.isAxiosError(error) && error.response) {
      const response =
        error.response as AxiosResponse<PublicRegistrationFormSubmitErrorResponse>;

      if (response.data && response.data.error) {
        yield put(rejectPublicRegistrationSubmission(response.data));
      } else {
        yield put(rejectPublicRegistrationSubmission({ error: {} }));
      }
    } else {
      yield put(rejectPublicRegistrationSubmission({ error: {} }));
    }
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
  yield takeLatest(submitPublicRegistration.type, submitRegistrationFormSaga);
}
