import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicRegistrationInitErrorResponse,
  PublicRegistrationInitResponse,
} from 'interfaces/publicRegistration';
import { storeExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicRegistrationInit,
  initRegistration,
  rejectPublicRegistrationInit,
} from 'redux/reducers/registration';
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
    // eslint-disable-next-line no-console
    console.error('caught error!', error);
    if (axios.isAxiosError(error) && error.response) {
      const response: AxiosResponse<PublicRegistrationInitErrorResponse> =
        error.response;
      yield put(rejectPublicRegistrationInit(response.data));
    } else {
      yield put(rejectPublicRegistrationInit({ error: {} }));
    }
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
}
