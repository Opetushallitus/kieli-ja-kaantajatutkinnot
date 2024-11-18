import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import {
  ClerkListExaminerFilters,
  ClerkListExaminerState,
} from 'interfaces/clerkListExaminer';
import { ExaminerDetails } from 'interfaces/examinerDetails';

const initialState: ClerkListExaminerState = {
  status: APIResponseStatus.NotStarted,
  examiners: [],
  filters: {
    examLanguage: ExamLanguage.ALL,
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
    setClerkListExaminerFilters(
      state,
      action: PayloadAction<ClerkListExaminerFilters>,
    ) {
      state.filters = action.payload;
    },
  },
});

export const {
  acceptClerkListExaminers,
  loadClerkListExaminers,
  rejectClerkListExaminers,
  setClerkListExaminerFilters,
} = clerkListExaminerSlice.actions;
export const clerkListExaminerReducer = clerkListExaminerSlice.reducer;
