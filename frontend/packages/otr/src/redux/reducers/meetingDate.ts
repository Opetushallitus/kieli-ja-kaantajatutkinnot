import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { MeetingDateStatus } from 'enums/meetingDate';
import { MeetingDate, MeetingDateFilter } from 'interfaces/meetingDate';

interface MeetingDatesState {
  status: APIResponseStatus;
  filters: MeetingDateFilter;
  meetingDates: Array<MeetingDate>;
}

interface AddMeetingDateState {
  status: APIResponseStatus;
  date: Dayjs;
}

interface RemoveMeetingDateState {
  status: APIResponseStatus;
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
      meetingStatus: MeetingDateStatus.Upcoming,
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
    },
    rejectMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.Error;
    },
    removeMeetingDate(state, _action: PayloadAction<number>) {
      state.removeMeetingDate.status = APIResponseStatus.InProgress;
    },
    removingMeetingDateSucceeded(state) {
      state.removeMeetingDate.status = APIResponseStatus.Success;
    },
    rejectMeetingDateRemove(state) {
      state.removeMeetingDate.status = APIResponseStatus.Error;
    },
    rejectMeetingDateAdd(state) {
      state.addMeetingDate.status = APIResponseStatus.Error;
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
