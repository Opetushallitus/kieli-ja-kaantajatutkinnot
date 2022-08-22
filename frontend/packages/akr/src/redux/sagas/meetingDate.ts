import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { Dayjs } from 'dayjs';
import { call, put, takeLatest } from 'redux-saga/effects';
import { DateUtils } from 'shared/utils';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { MeetingDateResponse } from 'interfaces/meetingDate';
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
import { SerializationUtils } from 'utils/serialization';

function* removeMeetingDateSaga(action: PayloadAction<number>) {
  try {
    yield call(
      axiosInstance.delete,
      `${APIEndpoints.MeetingDate}/${action.payload}`
    );
    yield put(removingMeetingDateSucceeded());
    yield put(loadMeetingDates());
  } catch (error) {
    yield put(rejectMeetingDateRemove(error as AxiosError));
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
    yield put(rejectMeetingDateAdd(error as AxiosError));
  }
}

function* loadMeetingDatesSaga() {
  try {
    const apiResponse: AxiosResponse<Array<MeetingDateResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.MeetingDate
    );

    const deserializedResponse = SerializationUtils.deserializeMeetingDates(
      apiResponse.data
    );
    yield put(storeMeetingDates(deserializedResponse.meetingDates));
  } catch (error) {
    yield put(rejectMeetingDates(error as AxiosError));
  }
}

export function* watchMeetingDates() {
  yield takeLatest(loadMeetingDates, loadMeetingDatesSaga);
  yield takeLatest(addMeetingDate.type, addMeetingDateSaga);
  yield takeLatest(removeMeetingDate.type, removeMeetingDateSaga);
}
