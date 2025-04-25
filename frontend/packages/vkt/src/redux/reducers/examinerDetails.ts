import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import {
  ExaminerDetails,
  ExaminerDetailsState,
} from 'interfaces/examinerDetails';

const initialState: ExaminerDetailsState = {
  status: APIResponseStatus.NotStarted,
  examEventFilters: {
    languageFilter: ExamLanguage.ALL,
    toggleFilter: ExamEventToggleFilter.Upcoming,
  },
};

const examinerDetailsSlice = createSlice({
  name: 'examinerDetails',
  initialState,
  reducers: {
    loadExaminerDetails(state, _action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
      state.initialized = undefined;
    },
    rejectExaminerDetails(state, action: PayloadAction<boolean>) {
      state.status = APIResponseStatus.Error;
      state.initialized = action.payload;
    },
    storeExaminerDetails(state, action: PayloadAction<ExaminerDetails>) {
      state.status = APIResponseStatus.Success;
      state.examiner = action.payload;
      state.initialized = true;
    },
    setExaminerOid(state, action: PayloadAction<string>) {
      state.oid = action.payload;
    },
    setExaminerExamEventLanguageFilter(
      state,
      action: PayloadAction<ExamLanguage>,
    ) {
      state.examEventFilters.languageFilter = action.payload;
    },
    setExaminerExamEventToggleFilter(
      state,
      action: PayloadAction<ExamEventToggleFilter>,
    ) {
      state.examEventFilters.toggleFilter = action.payload;
    },
    resetExaminerDetailsToInitialState(state) {
      return { ...initialState, oid: state.oid };
    },
  },
});

export const examinerDetailsReducer = examinerDetailsSlice.reducer;
export const {
  loadExaminerDetails,
  rejectExaminerDetails,
  storeExaminerDetails,
  setExaminerOid,
  setExaminerExamEventLanguageFilter,
  setExaminerExamEventToggleFilter,
  resetExaminerDetailsToInitialState,
} = examinerDetailsSlice.actions;
