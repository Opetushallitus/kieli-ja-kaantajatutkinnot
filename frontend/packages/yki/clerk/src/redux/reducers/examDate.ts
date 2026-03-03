import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { CreateExamDateRequest, ExamDate } from 'interfaces/examDate';

interface ExamDateState {
  status: APIResponseStatus;
  addStatus: APIResponseStatus;
  examDates: ExamDate[];
}

const initialState: ExamDateState = {
  status: APIResponseStatus.NotStarted,
  addStatus: APIResponseStatus.NotStarted,
  examDates: [],
};

const examDateSlice = createSlice({
  name: 'examDate',
  initialState,
  reducers: {
    loadExamDates(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamDates(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamDates(state, action: PayloadAction<ExamDate[]>) {
      state.status = APIResponseStatus.Success;
      state.examDates = action.payload;
    },
    addExamDate(state, _action: PayloadAction<CreateExamDateRequest>) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    rejectAddExamDate(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    storeAddExamDate(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    resetAddExamDateStatus(state) {
      state.addStatus = APIResponseStatus.NotStarted;
    },
  },
});

export const examDateReducer = examDateSlice.reducer;
export const {
  loadExamDates,
  rejectExamDates,
  storeExamDates,
  addExamDate,
  rejectAddExamDate,
  storeAddExamDate,
  resetAddExamDateStatus,
} = examDateSlice.actions;
