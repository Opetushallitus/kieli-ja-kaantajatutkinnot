import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { MeetingDateStatus } from 'enums/meetingDate';
import { MeetingDate, MeetingDateFilter } from 'interfaces/meetingDate';
import { PaginationState } from 'interfaces/pagination';

interface MeetingDatesState {
  filters: MeetingDateFilter;
  meetingDates: Array<MeetingDate>;
  status: APIResponseStatus;
}

interface AddMeetingDateState {
  date: Dayjs;
  status: APIResponseStatus;
}

interface RemoveMeetingDateState {
  date: Dayjs | undefined;
  status: APIResponseStatus;
}

interface MeetingDateState {
  meetingDates: MeetingDatesState;
  addMeetingDate: AddMeetingDateState;
  removeMeetingDate: RemoveMeetingDateState;
  pagination: PaginationState;
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
    date: undefined,
  },
  pagination: {
    page: 0,
    rowsPerPage: 10,
  },
};

const meetingDateSlice = createSlice({
  name: 'meetingDate',
  initialState,
  reducers: {
    addMeetingDate(state, action: PayloadAction<Dayjs>) {
      state.addMeetingDate.status = APIResponseStatus.InProgress;
      state.addMeetingDate.date = action.payload;
    },
    addingMeetingDateSucceeded(state) {
      state.addMeetingDate.status = APIResponseStatus.Success;
    },
    loadMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.InProgress;
    },
    rejectMeetingDateAdd(state) {
      state.addMeetingDate.status = APIResponseStatus.Error;
    },
    rejectMeetingDateRemove(state) {
      state.removeMeetingDate.status = APIResponseStatus.Error;
    },
    rejectMeetingDates(state) {
      state.meetingDates.status = APIResponseStatus.Error;
    },
    removeMeetingDate(state, action: PayloadAction<MeetingDate>) {
      state.removeMeetingDate.status = APIResponseStatus.InProgress;
      state.removeMeetingDate.date = action.payload.date;
    },
    removingMeetingDateSucceeded(state) {
      state.removeMeetingDate.status = APIResponseStatus.Success;
    },
    resetMeetingDateAdd(state) {
      state.addMeetingDate.status = initialState.addMeetingDate.status;
      state.addMeetingDate.date = initialState.addMeetingDate.date;
    },
    resetMeetingDateRemove(state) {
      state.removeMeetingDate.status = initialState.removeMeetingDate.status;
      state.removeMeetingDate.date = initialState.removeMeetingDate.date;
    },
    setMeetingDateFilters(state, action: PayloadAction<MeetingDateFilter>) {
      state.meetingDates.filters = action.payload;
    },
    storeMeetingDates(state, action: PayloadAction<Array<MeetingDate>>) {
      state.meetingDates.status = APIResponseStatus.Success;
      state.meetingDates.meetingDates = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.pagination.rowsPerPage = action.payload;
    },
  },
});

export const meetingDateReducer = meetingDateSlice.reducer;
export const {
  addMeetingDate,
  addingMeetingDateSucceeded,
  loadMeetingDates,
  rejectMeetingDateAdd,
  rejectMeetingDateRemove,
  rejectMeetingDates,
  removeMeetingDate,
  removingMeetingDateSucceeded,
  resetMeetingDateAdd,
  resetMeetingDateRemove,
  setMeetingDateFilters,
  storeMeetingDates,
  setPage,
  setRowsPerPage,
} = meetingDateSlice.actions;
