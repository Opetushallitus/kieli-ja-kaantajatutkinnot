import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import {
  ExaminationDate,
  ExaminationDateFilter,
} from 'interfaces/examinationDate';
import { PaginationState } from 'interfaces/pagination';
interface ExaminationDatesState {
  dates: Array<ExaminationDate>;
  status: APIResponseStatus;
}

interface AddExaminationDateState {
  date: Dayjs;
  status: APIResponseStatus;
}

interface RemoveExaminationDateState {
  date: Dayjs | undefined;
  status: APIResponseStatus;
}

interface ExaminationDateState {
  examinationDates: ExaminationDatesState;
  addExaminationDate: AddExaminationDateState;
  removeExaminationDate: RemoveExaminationDateState;
  filter: ExaminationDateFilter;
  pagination: PaginationState;
}

const initialState: ExaminationDateState = {
  addExaminationDate: {
    status: APIResponseStatus.NotStarted,
    date: dayjs(),
  },
  examinationDates: {
    status: APIResponseStatus.NotStarted,
    dates: [],
  },
  removeExaminationDate: {
    status: APIResponseStatus.NotStarted,
    date: undefined,
  },
  filter: { examinationDateStatus: ExaminationDateStatus.Upcoming },
  pagination: {
    page: 0,
    rowsPerPage: 10,
  },
};

const examinationDateSlice = createSlice({
  name: 'examinationDate',
  initialState,
  reducers: {
    addExaminationDate(state, action: PayloadAction<Dayjs>) {
      state.addExaminationDate.status = APIResponseStatus.InProgress;
      state.addExaminationDate.date = action.payload;
    },
    addingExaminationDateSucceeded(state) {
      state.addExaminationDate.status = APIResponseStatus.Success;
    },
    loadExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.InProgress;
    },
    rejectExaminationDateAdd(state) {
      state.addExaminationDate.status = APIResponseStatus.Error;
    },
    rejectExaminationDateRemove(state) {
      state.removeExaminationDate.status = APIResponseStatus.Error;
    },
    rejectExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.Error;
    },
    removeExaminationDate(state, action: PayloadAction<ExaminationDate>) {
      state.removeExaminationDate.status = APIResponseStatus.InProgress;
      state.removeExaminationDate.date = action.payload.date;
    },
    removingExaminationDateSucceeded(state) {
      state.removeExaminationDate.status = APIResponseStatus.Success;
    },
    resetExaminationDateAdd(state) {
      state.addExaminationDate.status = initialState.addExaminationDate.status;
      state.addExaminationDate.date = initialState.addExaminationDate.date;
    },
    resetExaminationDateRemove(state) {
      state.removeExaminationDate.status =
        initialState.removeExaminationDate.status;
      state.removeExaminationDate.date =
        initialState.removeExaminationDate.date;
    },
    setExaminationDateFilters(
      state,
      action: PayloadAction<ExaminationDateFilter>
    ) {
      state.filter = action.payload;
    },
    storeExaminationDates(
      state,
      action: PayloadAction<Array<ExaminationDate>>
    ) {
      state.examinationDates.dates = action.payload;
      state.examinationDates.status = APIResponseStatus.Success;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.pagination.rowsPerPage = action.payload;
    },
  },
});

export const examinationDateReducer = examinationDateSlice.reducer;
export const {
  addExaminationDate,
  addingExaminationDateSucceeded,
  loadExaminationDates,
  rejectExaminationDateAdd,
  rejectExaminationDateRemove,
  rejectExaminationDates,
  removeExaminationDate,
  removingExaminationDateSucceeded,
  resetExaminationDateAdd,
  resetExaminationDateRemove,
  setExaminationDateFilters,
  storeExaminationDates,
  setPage,
  setRowsPerPage,
} = examinationDateSlice.actions;
