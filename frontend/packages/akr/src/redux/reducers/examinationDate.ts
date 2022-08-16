import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import {
  ExaminationDate,
  ExaminationDateFilter,
} from 'interfaces/examinationDate';

interface ExaminationDatesState {
  status: APIResponseStatus;
  dates: Array<ExaminationDate>;
}

interface AddExaminationDateState {
  status: APIResponseStatus;
  date: Dayjs;
}

interface RemoveExaminationDateState {
  status: APIResponseStatus;
  examinationDateId: number | undefined;
}

interface ExaminationDateState {
  examinationDates: ExaminationDatesState;
  addExaminationDate: AddExaminationDateState;
  removeExaminationDate: RemoveExaminationDateState;
  filter: ExaminationDateFilter;
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
    examinationDateId: undefined,
  },
  filter: { examinationDateStatus: ExaminationDateStatus.Upcoming },
};

const examinationDateSlice = createSlice({
  name: 'examinationDate',
  initialState,
  reducers: {
    addExaminationDate(state, _action: PayloadAction<Dayjs>) {
      state.addExaminationDate.status = APIResponseStatus.InProgress;
    },
    addExaminationDateFilter(
      state,
      action: PayloadAction<ExaminationDateFilter>
    ) {
      state.filter = action.payload;
    },
    addingExaminationDateSucceeded(state) {
      state.addExaminationDate.status = APIResponseStatus.Success;
    },
    loadExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.InProgress;
    },
    rejectExaminationDates(state) {
      state.examinationDates.status = APIResponseStatus.Error;
    },
    rejectExaminationDateAdd(state) {
      state.addExaminationDate.status = APIResponseStatus.Error;
    },
    rejectExaminationDateRemove(state) {
      state.removeExaminationDate.status = APIResponseStatus.Error;
    },
    removeExaminationDate(state, _action: PayloadAction<number>) {
      state.removeExaminationDate.status = APIResponseStatus.InProgress;
    },
    removingExaminationDateSucceeded(state) {
      state.removeExaminationDate.status = APIResponseStatus.Success;
    },
    storeExaminationDates(
      state,
      action: PayloadAction<Array<ExaminationDate>>
    ) {
      state.examinationDates.dates = action.payload;
      state.examinationDates.status = APIResponseStatus.Success;
    },
  },
});

export const examinationDateReducer = examinationDateSlice.reducer;
export const {
  addExaminationDate,
  addExaminationDateFilter,
  addingExaminationDateSucceeded,
  loadExaminationDates,
  rejectExaminationDates,
  rejectExaminationDateAdd,
  rejectExaminationDateRemove,
  removeExaminationDate,
  removingExaminationDateSucceeded,
  storeExaminationDates,
} = examinationDateSlice.actions;
