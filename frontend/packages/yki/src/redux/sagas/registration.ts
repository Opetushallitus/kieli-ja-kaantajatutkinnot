import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicRegistrationInitResponse } from 'interfaces/publicRegistration';
import {
  acceptPublicEmailRegistrationInit,
  acceptPublicSuomiFiRegistrationInit,
  initRegistration,
  rejectPublicRegistration,
} from 'redux/reducers/registration';

const mockInitResponse = (examSessionId: number) =>
  ({
    data: {
      exam_session: { id: examSessionId },
      is_strongly_identified: false,
      registration_id: 1337,
      user: {
        email: 'testi123@test.invalid',
      },
    },
  } as AxiosResponse<PublicRegistrationInitResponse>);

function* initRegistrationSaga(action: PayloadAction<number>) {
  try {
    // TODO Remove mock response
    const response: AxiosResponse<PublicRegistrationInitResponse> =
      action.payload > 0
        ? mockInitResponse(action.payload)
        : yield call(
            axiosInstance.post,
            APIEndpoints.InitRegistration,
            JSON.stringify({ exam_session_id: action.payload })
          );
    const { data } = response;
    if (data.is_strongly_identified) {
      yield put(acceptPublicSuomiFiRegistrationInit(data));
    } else {
      yield put(acceptPublicEmailRegistrationInit(data));
    }
  } catch (error) {
    yield put(rejectPublicRegistration());
  }
}

export function* watchRegistration() {
  yield takeLatest(initRegistration.type, initRegistrationSaga);
}
