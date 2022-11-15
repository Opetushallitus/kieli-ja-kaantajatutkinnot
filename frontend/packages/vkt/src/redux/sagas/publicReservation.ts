import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicUIViews } from 'enums/app';
import { PublicReservationResponse } from 'interfaces/publicReservation';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadReservation,
  rejectReservation,
  storeReservation,
} from 'redux/reducers/publicReservation';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadReservationSaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<PublicReservationResponse> = yield call(
      axiosInstance.post,
      `${APIEndpoints.PublicExamEvent}/${action.payload}/reservation`,
      action.payload
    );
    const publicReservation = SerializationUtils.deserializePublicReservation(
      response.data
    );

    yield put(storeReservation(publicReservation));
    yield put(setPublicUIView(PublicUIViews.Reservation));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectReservation());
  }
}

export function* watchPublicReservations() {
  yield takeLatest(loadReservation, loadReservationSaga);
}
