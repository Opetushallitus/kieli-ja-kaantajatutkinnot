import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { MeetingStatus } from 'enums/meetingDate';
import { MeetingDate, MeetingDateFilter } from 'interfaces/meetingDate';
import { ResponseState } from 'interfaces/responseState';

interface MeetingDatesState extends ResponseState {
  filters: MeetingDateFilter;
  meetingDates: Array<MeetingDate>;
}

interface AddMeetingDateState extends ResponseState {
  date: Dayjs;
}

interface RemoveMeetingDateState extends ResponseState {
  meetingDateId: number | undefined;
}

interface MeetingDateState {
  meetingDates: MeetingDatesState;
  addMeetingDate: AddMeetingDateState;
  removeMeetingDate: RemoveMeetingDateState;
}

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
    addMeetingDate(state, _action: PayloadAction<Dayjs>) {
      state.addMeetingDate.status = APIResponseStatus.InProgress;
    },
    addMeetingDateFilter(state, action: PayloadAction<MeetingDateFilter>) {
      state.meetingDates.filters = action.payload;
    },
    addingMeetingDateSucceeded(state) {
      state.addMeetingDate.status = APIResponseStatus.Success;
    },
    loadMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.InProgress;
      state.meetingDates.error = undefined;
    },
    rejectMeetingDates(state, action: PayloadAction<AxiosError>) {
      state.meetingDates.status = APIResponseStatus.Error;
      state.meetingDates.error = action.payload;
    },
    removeMeetingDate(state, _action: PayloadAction<number>) {
      state.removeMeetingDate.status = APIResponseStatus.InProgress;
      state.removeMeetingDate.error = undefined;
    },
    removingMeetingDateSucceeded(state) {
      state.removeMeetingDate.status = APIResponseStatus.Success;
    },
    rejectMeetingDateRemove(state, action: PayloadAction<AxiosError>) {
      state.removeMeetingDate.status = APIResponseStatus.Error;
      state.removeMeetingDate.error = action.payload;
    },
    rejectMeetingDateAdd(state, action: PayloadAction<AxiosError>) {
      state.addMeetingDate.status = APIResponseStatus.Error;
      state.addMeetingDate.error = action.payload;
    },
    storeMeetingDates(state, action: PayloadAction<Array<MeetingDate>>) {
      state.meetingDates.status = APIResponseStatus.Success;
      state.meetingDates.meetingDates = action.payload;
    },
  },
});

export const meetingDateReducer = meetingDateSlice.reducer;
export const {
  addMeetingDate,
  addMeetingDateFilter,
  addingMeetingDateSucceeded,
  loadMeetingDates,
  rejectMeetingDates,
  rejectMeetingDateAdd,
  rejectMeetingDateRemove,
  removeMeetingDate,
  removingMeetingDateSucceeded,
  storeMeetingDates,
} = meetingDateSlice.actions;
