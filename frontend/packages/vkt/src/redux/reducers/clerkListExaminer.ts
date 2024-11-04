import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkListExaminerState } from 'interfaces/clerkListExaminer';
import { ExaminerDetails } from 'interfaces/examinerDetails';

const initialState: ClerkListExaminerState = {
  status: APIResponseStatus.NotStarted,
  examiners: [],
};

const clerkListExaminerSlice = createSlice({
  name: 'clerkListExaminer',
  initialState,
  reducers: {
    acceptExaminers(state, action: PayloadAction<Array<ExaminerDetails>>) {
      state.status = APIResponseStatus.Success;
      state.examiners = action.payload;
    },
    loadExaminers(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExaminers(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const { acceptExaminers, loadExaminers, rejectExaminers } =
  clerkListExaminerSlice.actions;
export const clerkListExaminerReducer = clerkListExaminerSlice.reducer;
