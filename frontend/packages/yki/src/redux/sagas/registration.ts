import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicRegistrationInitResponse } from 'interfaces/publicRegistration';
import { storeExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicEmailRegistrationInit,
  acceptPublicSuomiFiRegistrationInit,
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
    if (data.is_strongly_identified) {
      yield put(acceptPublicSuomiFiRegistrationInit(data));
    } else {
      yield put(acceptPublicEmailRegistrationInit(data));
    }
  } catch (error) {
    yield put(rejectPublicRegistrationInit());
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
}
