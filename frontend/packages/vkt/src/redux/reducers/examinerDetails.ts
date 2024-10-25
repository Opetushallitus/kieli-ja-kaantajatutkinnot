import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ExaminerDetails,
  ExaminerDetailsState,
} from 'interfaces/examinerDetails';

const initialState: ExaminerDetailsState = {
  status: APIResponseStatus.NotStarted,
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
      state.initialized = undefined;
    },
    setExaminerOid(state, action: PayloadAction<string>) {
      state.oid = action.payload;
    },
  },
});

export const examinerDetailsReducer = examinerDetailsSlice.reducer;
export const {
  loadExaminerDetails,
  rejectExaminerDetails,
  storeExaminerDetails,
  setExaminerOid,
} = examinerDetailsSlice.actions;
