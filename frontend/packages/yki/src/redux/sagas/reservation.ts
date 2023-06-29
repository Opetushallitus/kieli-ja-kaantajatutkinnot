import { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { ReservationRequest } from 'interfaces/reservation';
import {
  acceptReservationRequest,
  rejectReservationRequest,
  sendReservationRequest,
} from 'redux/reducers/reservation';
import { SerializationUtils } from 'utils/serialization';

function* sendReservationRequestSaga(
  action: PayloadAction<ReservationRequest>
) {
  try {
    const { email, examSessionId } = action.payload;
    const lang = getCurrentLang();

    yield call(
      axiosInstance.post,
      APIEndpoints.ExamSessionQueue.replace(
        /:examSessionId/,
        `${examSessionId}`
      ),
      JSON.stringify({ email }),
      { params: { lang: SerializationUtils.serializeAppLanguage(lang) } }
    );
    yield put(acceptReservationRequest());
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const response = error.response;
      if (response.data && response.data.exists) {
        yield put(rejectReservationRequest(true));
      } else {
        yield put(rejectReservationRequest(false));
      }
    } else {
      yield put(rejectReservationRequest(false));
    }
  }
}

export function* watchReservationRequest() {
  yield takeLatest(sendReservationRequest.type, sendReservationRequestSaga);
}