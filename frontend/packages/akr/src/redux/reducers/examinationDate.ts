import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import {
  ExaminationDate,
  ExaminationDateFilter,
} from 'interfaces/examinationDate';
import { ResponseState } from 'interfaces/responseState';

interface ExaminationDatesState extends ResponseState {
  dates: Array<ExaminationDate>;
}

interface AddExaminationDateState extends ResponseState {
  date: Dayjs;
}

interface RemoveExaminationDateState extends ResponseState {
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
      state.addExaminationDate.error = initialState.addExaminationDate.error;
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
      state.examinationDates.error = initialState.examinationDates.error;
    },
    rejectExaminationDates(state, action: PayloadAction<AxiosError>) {
      state.examinationDates.status = APIResponseStatus.Error;
      state.examinationDates.error = action.payload;
    },
    rejectExaminationDateAdd(state, action: PayloadAction<AxiosError>) {
      state.addExaminationDate.status = APIResponseStatus.Error;
      state.addExaminationDate.error = action.payload;
    },
    rejectExaminationDateRemove(state, action: PayloadAction<AxiosError>) {
      state.removeExaminationDate.status = APIResponseStatus.Error;
      state.removeExaminationDate.error = action.payload;
    },
    removeExaminationDate(state, _action: PayloadAction<number>) {
      state.removeExaminationDate.status = APIResponseStatus.InProgress;
      state.removeExaminationDate.error =
        initialState.removeExaminationDate.error;
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
