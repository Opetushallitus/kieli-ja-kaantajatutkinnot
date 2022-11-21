import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import { setAPIError } from 'redux/reducers/APIError';
import {
  loadClerkExamEventOverview,
  rejectClerkExamEventDetailsUpdate,
  rejectClerkExamEventOverview,
  storeClerkExamEventOverview,
  updateClerkExamEventDetails,
  updatingClerkExamEventDetailsSucceeded,
} from 'redux/reducers/clerkExamEventOverview';
import { upsertExamEvents } from 'redux/reducers/clerkListExamEvent';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkExamEventOverviewSaga(action: PayloadAction<number>) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.get,
      `${APIEndpoints.ClerkExamEvent}/${action.payload}`
    );

    const examEvent = SerializationUtils.deserializeClerkExamEvent(
      apiResponse.data
    );
    yield put(storeClerkExamEventOverview(examEvent));
  } catch (error) {
    const t = translateOutsideComponent();
    yield put(
      setAPIError(t('vkt.component.clerkExamEventOverview.toasts.notFound'))
    );
    yield put(rejectClerkExamEventOverview());
  }
}

function* updateClerkExamEventDetailsSaga(
  action: PayloadAction<ClerkExamEvent>
) {
  try {
    const apiResponse: AxiosResponse<ClerkExamEventResponse> = yield call(
      axiosInstance.put,
      APIEndpoints.ClerkExamEvent,
      SerializationUtils.serializeClerkExamEvent(action.payload)
    );
    const examEvent = SerializationUtils.deserializeClerkExamEvent(
      apiResponse.data
    );
    yield put(upsertExamEvents(examEvent));
    yield put(updatingClerkExamEventDetailsSucceeded(examEvent));
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectClerkExamEventDetailsUpdate());
  }
}

export function* watchClerkExamEventOverview() {
  yield takeLatest(
    loadClerkExamEventOverview.type,
    loadClerkExamEventOverviewSaga
  );
  yield takeLatest(
    updateClerkExamEventDetails.type,
    updateClerkExamEventDetailsSaga
  );
}
