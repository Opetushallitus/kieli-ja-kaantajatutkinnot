import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamDate } from 'interfaces/examDate';

interface ExamDateState {
  status: APIResponseStatus;
  examDates: ExamDate[];
}

const initialState: ExamDateState = {
  status: APIResponseStatus.NotStarted,
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
  },
});

export const examDateReducer = examDateSlice.reducer;
export const { loadExamDates, rejectExamDates, storeExamDates } =
  examDateSlice.actions;
