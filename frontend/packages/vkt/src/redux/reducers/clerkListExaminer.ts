import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import {
  ClerkListExaminerExamEventFilters,
  ClerkListExaminerFilters,
  ClerkListExaminerState,
} from 'interfaces/clerkListExaminer';
import { ExaminerDetails } from 'interfaces/examinerDetails';

const initialState: ClerkListExaminerState = {
  status: APIResponseStatus.NotStarted,
  examiners: [],
  filters: {
    examiners: {
      examLanguage: ExamLanguage.ALL,
    },
    examEvents: {
      examLanguage: ExamLanguage.ALL,
      toggleFilters: ExamEventToggleFilter.Upcoming,
    },
  },
};

const clerkListExaminerSlice = createSlice({
  name: 'clerkListExaminer',
  initialState,
  reducers: {
    acceptClerkListExaminers(
      state,
      action: PayloadAction<Array<ExaminerDetails>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.examiners = action.payload;
    },
    loadClerkListExaminers(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkListExaminers(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkListExaminers(state) {
      state.status = initialState.status;
      state.examiners = initialState.examiners;
      state.filters = initialState.filters;
    },
    setClerkListExaminerFilters(
      state,
      action: PayloadAction<Partial<ClerkListExaminerFilters>>,
    ) {
      state.filters.examiners = {
        ...state.filters.examiners,
        ...action.payload,
      };
    },
    setClerkListExaminerExamEventFilters(
      state,
      action: PayloadAction<Partial<ClerkListExaminerExamEventFilters>>,
    ) {
      state.filters.examEvents = {
        ...state.filters.examEvents,
        ...action.payload,
      };
    },
  },
});

export const {
  acceptClerkListExaminers,
  loadClerkListExaminers,
  rejectClerkListExaminers,
  resetClerkListExaminers,
  setClerkListExaminerFilters,
  setClerkListExaminerExamEventFilters,
} = clerkListExaminerSlice.actions;
export const clerkListExaminerReducer = clerkListExaminerSlice.reducer;
