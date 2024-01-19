import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';
import { DateUtils } from 'shared/utils';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { MeetingDate, MeetingDateResponse } from 'interfaces/meetingDate';
import { setAPIError } from 'redux/reducers/APIError';
import {
  addingMeetingDateSucceeded,
  addMeetingDate,
  loadMeetingDates,
  rejectMeetingDateAdd,
  rejectMeetingDateRemove,
  rejectMeetingDates,
  removeMeetingDate,
  removingMeetingDateSucceeded,
  storeMeetingDates,
} from 'redux/reducers/meetingDate';
import { NotifierUtils } from 'utils/notifier';
import { SerializationUtils } from 'utils/serialization';

function* removeMeetingDateSaga(action: PayloadAction<MeetingDate>) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.MeetingDate}/${action.payload.id}`,
    );
    yield put(removingMeetingDateSucceeded());
    yield put(loadMeetingDates());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectMeetingDateRemove());
  }
}

function* addMeetingDateSaga(action: PayloadAction<Dayjs>) {
  try {
    yield call(axiosInstance.post, APIEndpoints.MeetingDate, {
      date: DateUtils.serializeDate(action.payload),
    });
    yield put(addingMeetingDateSucceeded());
    yield put(loadMeetingDates());
  } catch (error) {
    const errorMessage = NotifierUtils.getAPIErrorMessage(error as AxiosError);
    yield put(setAPIError(errorMessage));
    yield put(rejectMeetingDateAdd());
  }
}

function* loadMeetingDatesSaga() {
  try {
    const apiResponse: AxiosResponse<Array<MeetingDateResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.MeetingDate,
    );

    const deserializedResponse = SerializationUtils.deserializeMeetingDates(
      apiResponse.data,
    );
    yield put(storeMeetingDates(deserializedResponse.meetingDates));
  } catch (error) {
    yield put(rejectMeetingDates());
  }
}

export function* watchMeetingDates() {
  yield takeLatest(loadMeetingDates.type, loadMeetingDatesSaga);
  yield takeLatest(addMeetingDate.type, addMeetingDateSaga);
  yield takeLatest(removeMeetingDate.type, removeMeetingDateSaga);
}
