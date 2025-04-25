import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ExaminerExamEventUpsert,
  ExaminerExamEventUpsertState,
} from 'interfaces/examinerExamEvent';

const initialState: ExaminerExamEventUpsertState = {
  status: APIResponseStatus.NotStarted,
  examEvent: {
    isHidden: true,
  },
};

const examinerExamEventUpsertSlice = createSlice({
  name: 'examinerExamEventUpsert',
  initialState,
  reducers: {
    acceptExaminerExamEventUpsert(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectExaminerExamEventUpsert(state) {
      state.status = APIResponseStatus.Error;
    },
    resetExaminerExamEventUpsert(_) {
      return initialState;
    },
    startExaminerExamEventUpsert(state) {
      state.status = APIResponseStatus.InProgress;
    },
    updateExaminerExamEventUpsert(
      state,
      action: PayloadAction<Partial<ExaminerExamEventUpsert>>,
    ) {
      state.examEvent = { ...state.examEvent, ...action.payload };
    },
  },
});

export const {
  acceptExaminerExamEventUpsert,
  rejectExaminerExamEventUpsert,
  resetExaminerExamEventUpsert,
  startExaminerExamEventUpsert,
  updateExaminerExamEventUpsert,
} = examinerExamEventUpsertSlice.actions;
export const examinerExamEventUpsertReducer =
  examinerExamEventUpsertSlice.reducer;
