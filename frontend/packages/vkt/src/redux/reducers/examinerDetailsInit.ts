import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ExaminerDetailsInit,
  ExaminerDetailsInitState,
} from 'interfaces/examinerDetails';

const initialState: ExaminerDetailsInitState = {
  status: APIResponseStatus.NotStarted,
};

const examinerDetailsInitSlice = createSlice({
  name: 'examinerDetailsInit',
  initialState,
  reducers: {
    loadExaminerDetailsInit(state, _action: PayloadAction<string>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExaminerDetailsInit(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExaminerDetailsInit(
      state,
      action: PayloadAction<ExaminerDetailsInit>,
    ) {
      state.status = APIResponseStatus.Success;
      state.initData = action.payload;
    },
  },
});

export const examinerDetailsInitReducer = examinerDetailsInitSlice.reducer;
export const {
  loadExaminerDetailsInit,
  rejectExaminerDetailsInit,
  storeExaminerDetailsInit,
} = examinerDetailsInitSlice.actions;
