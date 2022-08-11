import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import {
  ExaminationDate,
  ExaminationDateFilter,
  ExaminationDateState,
} from 'interfaces/examinationDate';

const initialState: ExaminationDateState = {
  examinationDates: {
    status: APIResponseStatus.NotStarted,
    dates: [],
  },
  addExaminationDate: {
    status: APIResponseStatus.NotStarted,
    date: dayjs(),
  },
  removeExaminationDate: {
    status: APIResponseStatus.NotStarted,
    examinationDateId: undefined,
  },
  filter: { examinationDateStatus: ExaminationDateStatus.Upcoming },
};

const examinationDateSlice = createSlice({
  name: 'examinationDate',
  initialState,
  reducers: {
    addExaminationDateFilter(
      state,
      action: PayloadAction<ExaminationDateFilter>
    ) {
      state.filter = action.payload;
    },
    loadExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.InProgress;
    },
    rejectExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.Error;
    },
    storeExaminationDates(
      state,
      action: PayloadAction<Array<ExaminationDate>>
    ) {
      state.examinationDates.dates = action.payload;
      state.examinationDates.status = APIResponseStatus.Success;
    },
    removeExaminationDate(state, _action: PayloadAction<number>) {
      state.removeExaminationDate.status = APIResponseStatus.InProgress;
    },
    removingExaminationDateSucceeded(state) {
      state.removeExaminationDate.status = APIResponseStatus.Success;
    },
    rejectExaminationDateRemove(state) {
      state.removeExaminationDate.status = APIResponseStatus.Error;
    },
    addExaminationDate(state, _action: PayloadAction<Dayjs>) {
      state.addExaminationDate.status = APIResponseStatus.InProgress;
    },
    rejectExaminationDateAdd(state) {
      state.addExaminationDate.status = APIResponseStatus.Error;
    },
    addingExaminationDateSucceeded(state) {
      state.addExaminationDate.status = APIResponseStatus.Success;
    },
  },
});

export const examinationDateReducer = examinationDateSlice.reducer;
export const {
  addExaminationDate,
  addExaminationDateFilter,
  loadExaminationDates,
  rejectExaminationDates,
  storeExaminationDates,
  removeExaminationDate,
  removingExaminationDateSucceeded,
  rejectExaminationDateRemove,
  rejectExaminationDateAdd,
  addingExaminationDateSucceeded,
} = examinationDateSlice.actions;
