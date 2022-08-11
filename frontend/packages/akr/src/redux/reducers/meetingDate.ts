import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { MeetingStatus } from 'enums/meetingDate';
import {
  MeetingDate,
  MeetingDateFilter,
  MeetingDateState,
} from 'interfaces/meetingDate';

const initialState: MeetingDateState = {
  meetingDates: {
    status: APIResponseStatus.NotStarted,
    meetingDates: [],
    filters: {
      meetingStatus: MeetingStatus.Upcoming,
    },
  },
  addMeetingDate: {
    status: APIResponseStatus.NotStarted,
    date: dayjs(),
  },
  removeMeetingDate: {
    status: APIResponseStatus.NotStarted,
    meetingDateId: undefined,
  },
};

const meetingDateSlice = createSlice({
  name: 'meetingDate',
  initialState,
  reducers: {
    loadMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.InProgress;
    },
    storeMeetingDates(state, action: PayloadAction<Array<MeetingDate>>) {
      state.meetingDates.status = APIResponseStatus.Success;
      state.meetingDates.meetingDates = action.payload;
    },
    rejectMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.Error;
    },
    addMeetingDateFilter(state, action: PayloadAction<MeetingDateFilter>) {
      state.meetingDates.filters = {
        ...state.meetingDates.filters,
        ...action.payload,
      };
    },
    removeMeetingDate(state, action: PayloadAction<number>) {
      state.removeMeetingDate.status = APIResponseStatus.InProgress;
      state.removeMeetingDate.meetingDateId = action.payload;
    },
    removingMeetingDateSucceeded(state) {
      state.removeMeetingDate.status = APIResponseStatus.Success;
    },
    rejectMeetingDateRemove(state) {
      state.removeMeetingDate.status = APIResponseStatus.Error;
    },
    addMeetingDate(state, action: PayloadAction<Dayjs>) {
      state.addMeetingDate.status = APIResponseStatus.InProgress;
      state.addMeetingDate.date = action.payload;
    },
    addingMeetingDateSucceeded(state) {
      state.addMeetingDate.status = APIResponseStatus.Success;
    },
    rejectMeetingDateAdd(state) {
      state.addMeetingDate.status = APIResponseStatus.Error;
    },
  },
});

export const meetingDateReducer = meetingDateSlice.reducer;
export const {
  loadMeetingDates,
  storeMeetingDates,
  rejectMeetingDates,
  addMeetingDateFilter,
  removeMeetingDate,
  removingMeetingDateSucceeded,
  rejectMeetingDateRemove,
  addMeetingDate,
  addingMeetingDateSucceeded,
  rejectMeetingDateAdd,
} = meetingDateSlice.actions;
